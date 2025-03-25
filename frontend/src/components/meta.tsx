import Head from 'next/head';
import React from 'react';

interface MetaProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Meta({ 
  title = 'NBA Stat Projections',
  description = 'Statistical projections for NBA players and games with advanced visualization and filtering.',
  children 
}: MetaProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Preconnect to critical domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.nba.com" crossOrigin="anonymous" />
      
      {/* Preload critical fonts */}
      <link 
        rel="preload" 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
        as="style" 
      />
      
      {/* Other meta tags */}
      <meta name="theme-color" content="#0f172a" />
      <meta name="color-scheme" content="dark light" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Open Graph / Social Media */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="NBA Stat Projections" />
      
      {/* Custom meta tags */}
      {children}
    </Head>
  );
} 