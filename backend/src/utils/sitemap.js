/**
 * Sitemap parsing utilities
 * @fileoverview Functions to fetch, parse, and validate XML sitemaps
 */

import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import { validateUrl } from './validation.js';
import { logger } from './logger.js';
import { appConfig } from '../config/index.js';

/**
 * Fetch sitemap content from URL
 * @param {string} sitemapUrl - URL of the sitemap to fetch
 * @returns {Promise<string>} Raw XML content
 * @throws {Error} If fetch fails or URL is invalid
 */
export const fetchSitemap = async (sitemapUrl) => {
  logger.debug('Fetching sitemap', { url: sitemapUrl });

  try {
    // Validate and normalize URL
    const normalizedUrl = validateUrl(sitemapUrl);

    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'W3C-Checker-Bot/1.0 (Sitemap Scanner)',
        'Accept': 'application/xml, text/xml, */*',
      },
      timeout: 30000, // 30 second timeout
      follow: 5, // Follow up to 5 redirects
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('xml') && !contentType.includes('text')) {
      logger.warn('Unexpected content type for sitemap', { 
        url: sitemapUrl, 
        contentType 
      });
    }

    const content = await response.text();
    
    if (!content || content.trim().length === 0) {
      throw new Error('Empty sitemap content');
    }

    logger.info('Sitemap fetched successfully', { 
      url: sitemapUrl, 
      size: content.length,
      contentType 
    });

    return content;
  } catch (error) {
    logger.error('Failed to fetch sitemap', { 
      url: sitemapUrl, 
      error: error.message 
    });
    throw new Error(`Failed to fetch sitemap: ${error.message}`);
  }
};

/**
 * Parse XML sitemap and extract URLs
 * @param {string} xmlContent - Raw XML content
 * @returns {Promise<Array<string>>} Array of URLs found in sitemap
 * @throws {Error} If XML parsing fails or no URLs found
 */
export const parseSitemap = async (xmlContent) => {
  logger.debug('Parsing sitemap XML');

  try {
    return new Promise((resolve, reject) => {
      parseString(xmlContent, (err, result) => {
        if (err) {
          logger.error('XML parsing failed', { error: err.message });
          reject(new Error(`XML parsing failed: ${err.message}`));
          return;
        }

        try {
          const urls = extractUrlsFromParsedXml(result);
          
          if (urls.length === 0) {
            throw new Error('No URLs found in sitemap');
          }

          if (urls.length > appConfig.w3c.maxSitemapUrls) {
            throw new Error(
              `Sitemap contains ${urls.length} URLs, maximum allowed is ${appConfig.w3c.maxSitemapUrls}`
            );
          }

          logger.info('Sitemap parsed successfully', { 
            urlCount: urls.length,
            sampleUrls: urls.slice(0, 3) 
          });

          resolve(urls);
        } catch (extractError) {
          reject(extractError);
        }
      });
    });
  } catch (error) {
    logger.error('Sitemap parsing failed', { error: error.message });
    throw error;
  }
};

/**
 * Extract URLs from parsed XML object
 * @param {Object} parsedXml - Parsed XML object from xml2js
 * @returns {Array<string>} Array of extracted URLs
 */
const extractUrlsFromParsedXml = (parsedXml) => {
  const urls = [];

  try {
    // Handle standard sitemap format
    if (parsedXml.urlset && parsedXml.urlset.url) {
      const urlEntries = Array.isArray(parsedXml.urlset.url) 
        ? parsedXml.urlset.url 
        : [parsedXml.urlset.url];

      for (const urlEntry of urlEntries) {
        if (urlEntry.loc && urlEntry.loc[0]) {
          const url = urlEntry.loc[0].trim();
          if (url && isValidHttpUrl(url)) {
            urls.push(url);
          }
        }
      }
    }

    // Handle sitemap index format (contains links to other sitemaps)
    if (parsedXml.sitemapindex && parsedXml.sitemapindex.sitemap) {
      logger.warn('Sitemap index detected - only processing first-level URLs');
      
      const sitemapEntries = Array.isArray(parsedXml.sitemapindex.sitemap)
        ? parsedXml.sitemapindex.sitemap
        : [parsedXml.sitemapindex.sitemap];

      for (const sitemapEntry of sitemapEntries) {
        if (sitemapEntry.loc && sitemapEntry.loc[0]) {
          const url = sitemapEntry.loc[0].trim();
          if (url && isValidHttpUrl(url)) {
            urls.push(url);
          }
        }
      }
    }

    // Remove duplicates and validate URLs
    const uniqueUrls = [...new Set(urls)];
    const validUrls = uniqueUrls.filter(url => {
      try {
        validateUrl(url);
        return true;
      } catch (error) {
        logger.warn('Invalid URL in sitemap', { url, error: error.message });
        return false;
      }
    });

    return validUrls;
  } catch (error) {
    logger.error('URL extraction failed', { error: error.message });
    throw new Error('Failed to extract URLs from sitemap');
  }
};

/**
 * Check if string is a valid HTTP/HTTPS URL
 * @param {string} string - String to validate
 * @returns {boolean} True if valid HTTP/HTTPS URL
 */
const isValidHttpUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

/**
 * Validate sitemap structure and content
 * @param {string} sitemapUrl - URL of the sitemap
 * @returns {Promise<Object>} Validation result with URLs and metadata
 */
export const validateAndParseSitemap = async (sitemapUrl) => {
  logger.info('Validating and parsing sitemap', { url: sitemapUrl });

  try {
    // Fetch sitemap content
    const xmlContent = await fetchSitemap(sitemapUrl);
    
    // Parse and extract URLs
    const urls = await parseSitemap(xmlContent);
    
    // Additional validation
    const validation = {
      isValid: true,
      urlCount: urls.length,
      urls: urls,
      warnings: [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        contentSize: xmlContent.length,
        sitemapUrl,
      },
    };

    // Check for common issues
    if (urls.length > 1000) {
      validation.warnings.push('Large sitemap with many URLs - scanning may take a while');
    }

    // Check URL patterns
    const domains = [...new Set(urls.map(url => new URL(url).hostname))];
    if (domains.length > 1) {
      validation.warnings.push('Sitemap contains URLs from multiple domains');
      validation.metadata.domains = domains;
    }

    // Check for HTTPS usage
    const httpUrls = urls.filter(url => url.startsWith('http://'));
    if (httpUrls.length > 0) {
      validation.warnings.push(`${httpUrls.length} URLs use HTTP instead of HTTPS`);
    }

    logger.info('Sitemap validation completed', {
      url: sitemapUrl,
      urlCount: validation.urlCount,
      warnings: validation.warnings.length,
      domains: domains.length,
    });

    return validation;
  } catch (error) {
    logger.error('Sitemap validation failed', { 
      url: sitemapUrl, 
      error: error.message 
    });
    
    return {
      isValid: false,
      error: error.message,
      urlCount: 0,
      urls: [],
      warnings: [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        sitemapUrl,
      },
    };
  }
};

/**
 * Get sitemap info without full parsing (for quick preview)
 * @param {string} sitemapUrl - URL of the sitemap
 * @returns {Promise<Object>} Basic sitemap information
 */
export const getSitemapInfo = async (sitemapUrl) => {
  try {
    const response = await fetch(validateUrl(sitemapUrl), {
      method: 'HEAD',
      timeout: 10000,
    });

    const info = {
      accessible: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      lastModified: response.headers.get('last-modified'),
      server: response.headers.get('server'),
    };

    logger.debug('Sitemap info retrieved', { url: sitemapUrl, info });
    return info;
  } catch (error) {
    logger.warn('Failed to get sitemap info', { 
      url: sitemapUrl, 
      error: error.message 
    });
    
    return {
      accessible: false,
      error: error.message,
    };
  }
};
