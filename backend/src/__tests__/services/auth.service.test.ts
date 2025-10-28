/**
 * Authentication service tests
 * @fileoverview Integration tests for AuthService with database
 */

import { AuthService } from '@/services/auth.service.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Mock the database and logger
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  credit: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

jest.mock('@/config/database.js', () => ({
  getDatabase: () => mockPrisma,
}));

jest.mock('@/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/utils/jwt.js', () => ({
  generateToken: jest.fn().mockResolvedValue('mock-jwt-token'),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'Test123!',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        email: mockUserData.email,
        createdAt: new Date(),
      };

      // Mock user doesn't exist
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock transaction
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          credit: {
            create: jest.fn().mockResolvedValue({ userId: 1, amount: 5 }),
          },
        });
      });

      const result = await authService.register(mockUserData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(mockUserData.email);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw ConflictError if email already exists', async () => {
      const existingUser = {
        id: 1,
        email: mockUserData.email,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(authService.register(mockUserData)).rejects.toThrow('Email already registered');
    });

    it('should handle database errors during registration', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.register(mockUserData)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'Test123!',
    };

    it('should login user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(mockCredentials.password, 12);
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
        hashPassword: hashedPassword,
        createdAt: new Date(),
        credits: { amount: 10 },
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login(mockCredentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(mockCredentials.email);
      expect(result.user.credits).toBe(10);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw AuthenticationError for non-existent user', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockCredentials)).rejects.toThrow('Invalid email or password');
    });

    it('should throw AuthenticationError for invalid password', async () => {
      const mockUser = {
        id: 1,
        email: mockCredentials.email,
        hashPassword: 'wrong-hash',
        credits: { amount: 10 },
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(mockCredentials)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        credits: {
          amount: 25,
          updatedAt: new Date(),
        },
        _count: {
          scans: 5,
        },
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUserProfile(1);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        credits: 25,
        creditsUpdatedAt: mockUser.credits.updatedAt,
        totalScans: 5,
      });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.getUserProfile(999)).rejects.toThrow('User not found');
    });
  });

  describe('changePassword', () => {
    const userId = 1;
    const passwordData = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
    };

    it('should change password successfully', async () => {
      const hashedCurrentPassword = await bcrypt.hash(passwordData.currentPassword, 12);
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        hashPassword: hashedCurrentPassword,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ id: userId });

      const result = await authService.changePassword(userId, passwordData);

      expect(result).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          hashPassword: expect.any(String),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw AuthenticationError for invalid current password', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        hashPassword: 'wrong-hash',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.changePassword(userId, passwordData))
        .rejects.toThrow('Current password is incorrect');
    });
  });
});

// Integration test example (would require actual database)
describe('AuthService Integration', () => {
  // These tests would run against a test database
  // and test the complete flow including actual bcrypt hashing

  it.skip('should complete full registration and login flow', async () => {
    // This test would:
    // 1. Register a new user
    // 2. Verify user exists in database
    // 3. Login with same credentials
    // 4. Verify JWT token is valid
    // 5. Cleanup test data
  });

  it.skip('should handle concurrent registrations with same email', async () => {
    // This test would verify proper handling of race conditions
  });

  it.skip('should properly hash passwords with bcrypt', async () => {
    // This test would verify password hashing works correctly
  });
});
