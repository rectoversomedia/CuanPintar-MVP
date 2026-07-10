/**
 * SEO Meta Tags Component
 *
 * Provides comprehensive SEO metadata for pages
 */

'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: 'id_ID' | 'en_US';
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  structuredData?: Record<string, unknown>;
}

// Default SEO values
const DEFAULT_SEO = {
  title: 'CuanPintar - Customer Acquisition OS for Indonesia',
  description: 'Create one program and distribute it across verified media, creators, affiliates, sales teams, communities, and mission networks. Boost your customer acquisition in Indonesia.',
  keywords: ['customer acquisition', 'partner marketing', 'affiliate', 'media network', 'Indonesia', 'CPA', 'CPL', 'CPA Indonesia'],
  image: '/og-image.png',
  url: 'https://cuanpintar.com',
  locale: 'id_ID' as const,
  siteName: 'CuanPintar',
  twitterHandle: '@cuanpintar',
};

export function SEOMeta({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  locale = 'id_ID',
  noIndex = false,
  noFollow = false,
  canonical,
  structuredData,
}: SEOConfig) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge with defaults
  const fullTitle = title ? `${title} | CuanPintar` : DEFAULT_SEO.title;
  const fullDescription = description || DEFAULT_SEO.description;
  const fullKeywords = keywords?.join(', ') || DEFAULT_SEO.keywords.join(', ');
  const fullImage = image || DEFAULT_SEO.image;
  const fullUrl = url || DEFAULT_SEO.url;

  // Robot directive
  const robots = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  // JSON-LD structured data
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_SEO.siteName,
    url: 'https://cuanpintar.com',
    description: DEFAULT_SEO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DEFAULT_SEO.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Recto Vero Media',
    url: 'https://rectoversomedia.com',
    logo: `${DEFAULT_SEO.url}/icons/icon-512x512.png`,
    sameAs: [
      'https://www.instagram.com/cuanpintar',
      'https://www.linkedin.com/company/cuanpintar',
      'https://twitter.com/cuanpintar',
    ],
  };

  const articleSchema = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: fullDescription,
    image: fullImage,
    author: {
      '@type': 'Person',
      name: author || 'CuanPintar',
    },
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_SEO.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${DEFAULT_SEO.url}/icons/icon-512x512.png`,
      },
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
  } : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="author" content={author || 'CuanPintar'} />
      <meta name="theme-color" content="#0066FF" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="CuanPintar" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && tags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULT_SEO.twitterHandle} />
      <meta name="twitter:creator" content={author ? `@${author}` : DEFAULT_SEO.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="ID" />
      <meta name="geo.placename" content="Jakarta" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}

// SEO Provider component
export function SEOProvider({
  children,
  defaultConfig,
}: {
  children: React.ReactNode;
  defaultConfig?: SEOConfig;
}) {
  return (
    <>
      {defaultConfig && <SEOMeta {...defaultConfig} />}
      {children}
    </>
  );
}

// Hook to update SEO dynamically
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = `${config.title} | CuanPintar`;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && config.description) {
      metaDesc.setAttribute('content', config.description);
    }

    // Update og:image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && config.image) {
      ogImage.setAttribute('content', config.image);
    }
  }, [config]);
}
