/**
 * Database seed script
 * @fileoverview Populates the database with initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Main seed function
 */
async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  try {
    // Create demo users
    const demoUsers = [
      {
        email: 'demo@w3c-checker.com',
        password: 'Demo123!',
        credits: 100,
      },
      {
        email: 'test@example.com',
        password: 'Test123!',
        credits: 50,
      },
      {
        email: 'developer@localhost.com',
        password: 'Dev123!',
        credits: 1000,
      },
    ];

    console.log('👤 Creating demo users...');

    for (const userData of demoUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`   ⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create user with credits in transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: userData.email,
            hashPassword: hashedPassword,
          },
        });

        await tx.credit.create({
          data: {
            userId: newUser.id,
            amount: userData.credits,
          },
        });

        return newUser;
      });

      console.log(`   ✅ Created user: ${user.email} with ${userData.credits} credits`);
    }

    // Create demo scans for the first user
    console.log('📊 Creating demo scans...');

    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@w3c-checker.com' },
    });

    if (demoUser) {
      const demoScans = [
        {
          sitemapUrl: 'https://example.com/sitemap.xml',
          status: 'success' as const,
          totalUrls: 25,
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          finishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 minutes later
        },
        {
          sitemapUrl: 'https://test-site.com/sitemap.xml',
          status: 'success' as const,
          totalUrls: 10,
          startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000), // 3 minutes later
        },
        {
          sitemapUrl: 'https://blog.example.org/sitemap.xml',
          status: 'failed' as const,
          totalUrls: 0,
          startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          finishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 30 * 1000), // 30 seconds later
          errorMsg: 'Sitemap not accessible: HTTP 404',
        },
        {
          sitemapUrl: 'https://news.example.net/sitemap.xml',
          status: 'processing' as const,
          totalUrls: 150,
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
      ];

      for (const scanData of demoScans) {
        const existingScan = await prisma.scan.findFirst({
          where: {
            userId: demoUser.id,
            sitemapUrl: scanData.sitemapUrl,
          },
        });

        if (existingScan) {
          console.log(`   ⏭️  Scan for ${scanData.sitemapUrl} already exists, skipping...`);
          continue;
        }

        const scan = await prisma.scan.create({
          data: {
            userId: demoUser.id,
            ...scanData,
          },
        });

        console.log(`   ✅ Created scan: ${scan.sitemapUrl} (${scan.status})`);

        // Create demo scan results for successful scans
        if (scan.status === 'success' && scan.totalUrls && scan.totalUrls > 0) {
          const demoResults = [];
          
          for (let i = 1; i <= scan.totalUrls; i++) {
            const isValid = Math.random() > 0.3; // 70% valid pages
            const errorCount = isValid ? 0 : Math.floor(Math.random() * 3) + 1;
            const warningCount = Math.floor(Math.random() * 2);

            const errors = isValid ? [] : Array.from({ length: errorCount }, (_, idx) => ({
              type: 'error',
              message: `Sample validation error ${idx + 1} for demonstration`,
              line: Math.floor(Math.random() * 100) + 1,
              column: Math.floor(Math.random() * 50) + 1,
              severity: 'high',
            }));

            const warnings = Array.from({ length: warningCount }, (_, idx) => ({
              type: 'warning',
              message: `Sample validation warning ${idx + 1} for demonstration`,
              line: Math.floor(Math.random() * 100) + 1,
              column: Math.floor(Math.random() * 50) + 1,
              severity: 'medium',
            }));

            demoResults.push({
              scanId: scan.id,
              url: `https://${scan.sitemapUrl.split('/')[2]}/page-${i}.html`,
              errors,
              warnings,
              isValid,
            });
          }

          await prisma.scanResult.createMany({
            data: demoResults,
          });

          console.log(`   📋 Created ${demoResults.length} results for scan ${scan.id}`);
        }
      }
    }

    console.log('✅ Database seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

/**
 * Cleanup function for resetting the database
 */
async function cleanup(): Promise<void> {
  console.log('🧹 Cleaning up database...');
  
  await prisma.scanResult.deleteMany({});
  await prisma.scan.deleteMany({});
  await prisma.credit.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('✅ Database cleanup completed!');
}

// Run the seed
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Export functions for testing
export { main as seedDatabase, cleanup as cleanupDatabase };
