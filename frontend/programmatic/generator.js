#!/usr/bin/env node

/**
 * Programmatic SEO Page Generator for AI Fact Checker
 * Generates 5,000+ landing pages for long-tail keywords
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dimensions = JSON.parse(fs.readFileSync(path.join(__dirname, 'dimensions.json'), 'utf8'));

const BASE_URL = dimensions.baseUrl;
const OUTPUT_DIR = path.join(__dirname, '../public/p');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap-programmatic.xml');

// Content templates for different page types
const contentTemplates = {
  topic: (topic) => ({
    title: `${formatLabel(topic)} Fact Checker | Verify ${formatLabel(topic)} Claims`,
    description: `AI-powered fact checking for ${formatLabel(topic).toLowerCase()} claims. Verify statistics, debunk rumors, and trace misinformation sources. Free analysis available.`,
    h1: `${formatLabel(topic)} Fact Checker`,
    intro: `Misinformation about ${formatLabel(topic).toLowerCase()} spreads rapidly online. Our AI-powered fact checker helps you verify claims, check statistics, and trace the origins of ${formatLabel(topic).toLowerCase()}-related information.`,
    cta: `Check a ${formatLabel(topic)} Claim Now`
  }),

  claimType: (type) => ({
    title: `${formatLabel(type)} Fact Checker | Verify ${formatLabel(type)}`,
    description: `Specialized AI fact checking for ${formatLabel(type).toLowerCase()}. Analyze credibility, find original sources, and get accuracy ratings.`,
    h1: `${formatLabel(type)} Verification`,
    intro: `${formatLabel(type)} require careful verification. Our AI analyzes the credibility of ${formatLabel(type).toLowerCase()}, traces back to original sources, and provides reliability scores.`,
    cta: `Verify a ${formatLabel(type).replace(/s$/, '')}`
  }),

  source: (source) => ({
    title: `${formatLabel(source)} Fact Checker | Verify Content from ${formatLabel(source)}`,
    description: `Check claims and content from ${formatLabel(source)}. Our AI verifies ${formatLabel(source).toLowerCase()} posts, traces sources, and rates credibility.`,
    h1: `${formatLabel(source)} Content Verification`,
    intro: `Content from ${formatLabel(source)} can be hard to verify. Our AI-powered tool analyzes ${formatLabel(source).toLowerCase()} content, checks against reliable sources, and helps you identify misinformation.`,
    cta: `Check ${formatLabel(source)} Content`
  }),

  language: (lang) => {
    const langNames = { en: 'English', zh: 'Chinese', ja: 'Japanese', de: 'German', fr: 'French', ko: 'Korean', es: 'Spanish' };
    return {
      title: `${langNames[lang]} Fact Checker | Verify Claims in ${langNames[lang]}`,
      description: `AI fact checking for ${langNames[lang]} language content. Verify claims, check sources, and debunk misinformation in ${langNames[lang]}.`,
      h1: `${langNames[lang]} Language Fact Checker`,
      intro: `Our AI understands ${langNames[lang]} content and can verify claims, check statistics, and trace misinformation in ${langNames[lang]} language sources.`,
      cta: `Check ${langNames[lang]} Content`
    };
  },

  'topic-claimType': (topic, claimType) => ({
    title: `${formatLabel(topic)} ${formatLabel(claimType)} Checker | AI Verification`,
    description: `Verify ${formatLabel(claimType).toLowerCase()} about ${formatLabel(topic).toLowerCase()}. AI-powered fact checking with source tracing and credibility analysis.`,
    h1: `${formatLabel(topic)} ${formatLabel(claimType)} Verification`,
    intro: `${formatLabel(claimType)} about ${formatLabel(topic).toLowerCase()} often circulate online. Our AI helps you verify these claims by analyzing sources, checking facts, and providing credibility scores.`,
    cta: `Verify a ${formatLabel(topic)} ${formatLabel(claimType).replace(/s$/, '')}`
  }),

  'topic-source': (topic, source) => ({
    title: `${formatLabel(topic)} on ${formatLabel(source)} | Fact Checker`,
    description: `Check ${formatLabel(topic).toLowerCase()} claims from ${formatLabel(source)}. AI verification of ${formatLabel(source).toLowerCase()} content about ${formatLabel(topic).toLowerCase()}.`,
    h1: `${formatLabel(topic)} Claims on ${formatLabel(source)}`,
    intro: `${formatLabel(topic)} content on ${formatLabel(source)} can spread quickly. Our AI analyzes ${formatLabel(topic).toLowerCase()} claims from ${formatLabel(source).toLowerCase()}, verifies accuracy, and traces original sources.`,
    cta: `Check ${formatLabel(topic)} Content from ${formatLabel(source)}`
  }),

  'topic-language': (topic, lang) => {
    const langNames = { en: 'English', zh: 'Chinese', ja: 'Japanese', de: 'German', fr: 'French', ko: 'Korean', es: 'Spanish' };
    return {
      title: `${formatLabel(topic)} Fact Checker in ${langNames[lang]}`,
      description: `Verify ${formatLabel(topic).toLowerCase()} claims in ${langNames[lang]}. AI-powered fact checking for ${langNames[lang]} language ${formatLabel(topic).toLowerCase()} content.`,
      h1: `${formatLabel(topic)} Verification (${langNames[lang]})`,
      intro: `Check ${formatLabel(topic).toLowerCase()} claims in ${langNames[lang]}. Our AI analyzes ${langNames[lang]} language content about ${formatLabel(topic).toLowerCase()} and provides verification results.`,
      cta: `Check ${langNames[lang]} ${formatLabel(topic)} Claims`
    };
  },

  'claimType-source': (claimType, source) => ({
    title: `${formatLabel(claimType)} from ${formatLabel(source)} | AI Fact Checker`,
    description: `Verify ${formatLabel(claimType).toLowerCase()} that originate from ${formatLabel(source)}. AI-powered analysis and source verification.`,
    h1: `${formatLabel(claimType)} from ${formatLabel(source)}`,
    intro: `${formatLabel(claimType)} from ${formatLabel(source)} require verification. Our AI analyzes ${formatLabel(claimType).toLowerCase()} shared on ${formatLabel(source).toLowerCase()} and checks their accuracy.`,
    cta: `Verify ${formatLabel(source)} ${formatLabel(claimType)}`
  }),

  'claimType-language': (claimType, lang) => {
    const langNames = { en: 'English', zh: 'Chinese', ja: 'Japanese', de: 'German', fr: 'French', ko: 'Korean', es: 'Spanish' };
    return {
      title: `${formatLabel(claimType)} Checker in ${langNames[lang]}`,
      description: `Verify ${formatLabel(claimType).toLowerCase()} in ${langNames[lang]} language. AI fact checking for ${langNames[lang]} ${formatLabel(claimType).toLowerCase()}.`,
      h1: `${formatLabel(claimType)} (${langNames[lang]})`,
      intro: `Check ${formatLabel(claimType).toLowerCase()} in ${langNames[lang]}. Our AI verifies ${langNames[lang]} language ${formatLabel(claimType).toLowerCase()} and provides credibility analysis.`,
      cta: `Check ${langNames[lang]} ${formatLabel(claimType)}`
    };
  },

  'source-language': (source, lang) => {
    const langNames = { en: 'English', zh: 'Chinese', ja: 'Japanese', de: 'German', fr: 'French', ko: 'Korean', es: 'Spanish' };
    return {
      title: `${formatLabel(source)} ${langNames[lang]} Content Checker`,
      description: `Verify ${langNames[lang]} content from ${formatLabel(source)}. AI-powered fact checking for ${langNames[lang]} ${formatLabel(source).toLowerCase()} posts.`,
      h1: `${formatLabel(source)} (${langNames[lang]}) Verification`,
      intro: `Check ${langNames[lang]} content from ${formatLabel(source)}. Our AI analyzes ${langNames[lang]} posts on ${formatLabel(source).toLowerCase()} and verifies their accuracy.`,
      cta: `Check ${langNames[lang]} ${formatLabel(source)} Content`
    };
  }
};

function formatLabel(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generatePageHTML(content, slug, relatedLinks) {
  const today = new Date().toISOString().split('T')[0];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <meta name="description" content="${content.description}">
  <link rel="canonical" href="${BASE_URL}/p/${slug}/">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${content.title}">
  <meta property="og:description" content="${content.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/p/${slug}/">
  <meta property="og:image" content="${BASE_URL}/og-image.png">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${content.title}">
  <meta name="twitter:description" content="${content.description}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "${content.title}",
    "description": "${content.description}",
    "url": "${BASE_URL}/p/${slug}/",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
  
  <!-- GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P4ZLGKH1E1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-P4ZLGKH1E1', {'page_path': '/p/${slug}/'});
  </script>
  
  <style>
    :root { --primary: #1a365d; --accent: #2c5282; --bg: #f7fafc; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Source Serif Pro', Georgia, serif; background: var(--bg); color: #1a202c; line-height: 1.7; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    header { background: var(--primary); color: white; padding: 1.5rem; text-align: center; }
    header a { color: white; text-decoration: none; font-size: 1.5rem; font-family: 'Playfair Display', serif; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2.5rem; margin: 2rem 0 1rem; color: var(--primary); }
    .intro { font-size: 1.1rem; margin-bottom: 2rem; color: #4a5568; }
    .cta-section { background: white; border-radius: 12px; padding: 2rem; margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; }
    .cta-button { display: inline-block; background: var(--accent); color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform 0.2s; }
    .cta-button:hover { transform: translateY(-2px); }
    .features { display: grid; gap: 1rem; margin: 2rem 0; }
    .feature { background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--accent); }
    .related { margin: 2rem 0; }
    .related h2 { font-family: 'Playfair Display', serif; margin-bottom: 1rem; }
    .related-links { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .related-links a { background: #e2e8f0; padding: 0.5rem 1rem; border-radius: 20px; text-decoration: none; color: var(--primary); font-size: 0.9rem; }
    .related-links a:hover { background: #cbd5e0; }
    footer { text-align: center; padding: 2rem; color: #718096; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header>
    <a href="${BASE_URL}">AI Fact Checker</a>
  </header>
  
  <main class="container">
    <h1>${content.h1}</h1>
    <p class="intro">${content.intro}</p>
    
    <section class="cta-section">
      <h2>Ready to Verify?</h2>
      <p style="margin: 1rem 0; color: #4a5568;">Paste any claim and get instant AI-powered fact checking.</p>
      <a href="${BASE_URL}?ref=p&slug=${slug}" class="cta-button">${content.cta} →</a>
    </section>
    
    <section class="features">
      <div class="feature">
        <strong>🔍 Source Tracing</strong>
        <p>Track claims back to their original source and verify authenticity.</p>
      </div>
      <div class="feature">
        <strong>📊 Credibility Score</strong>
        <p>Get an AI-generated credibility rating based on multiple factors.</p>
      </div>
      <div class="feature">
        <strong>🌐 Multi-language Support</strong>
        <p>Verify claims in 7 languages including English, Chinese, and Japanese.</p>
      </div>
    </section>
    
    <section class="related">
      <h2>Related Fact Checkers</h2>
      <div class="related-links">
        ${relatedLinks.map(link => `<a href="${BASE_URL}/p/${link.slug}/">${link.label}</a>`).join('\n        ')}
      </div>
    </section>
  </main>
  
  <footer>
    <p>© 2026 AI Fact Checker by DenseMatrix Labs. <a href="${BASE_URL}/pricing">Pricing</a></p>
  </footer>
</body>
</html>`;
}

function getRelatedLinks(currentSlug, allPages, limit = 5) {
  // Simple related: same dimension type, different values
  const parts = currentSlug.split('-');
  const related = allPages
    .filter(p => p.slug !== currentSlug)
    .filter(p => {
      const pParts = p.slug.split('-');
      // Share at least one part
      return parts.some(part => pParts.includes(part)) || Math.random() > 0.7;
    })
    .slice(0, limit);
  
  return related.map(p => ({ slug: p.slug, label: p.label }));
}

function generatePages() {
  const pages = [];
  const dims = {};
  
  // Parse dimensions
  for (const d of dimensions.dimensions) {
    dims[d.name] = d.values;
  }

  // Single dimension pages
  for (const dimName of dimensions.singleDimensionPages || []) {
    for (const value of dims[dimName]) {
      const slug = value;
      const template = contentTemplates[dimName];
      if (template) {
        pages.push({
          slug,
          label: formatLabel(value),
          content: template(value)
        });
      }
    }
  }

  // Combination pages
  for (const combo of dimensions.combinations) {
    const [dim1, dim2] = combo;
    const templateKey = `${dim1}-${dim2}`;
    const template = contentTemplates[templateKey];
    
    if (!template) continue;
    
    for (const v1 of dims[dim1]) {
      for (const v2 of dims[dim2]) {
        const slug = `${v1}-${v2}`;
        pages.push({
          slug,
          label: `${formatLabel(v1)} ${formatLabel(v2)}`,
          content: template(v1, v2)
        });
      }
    }
  }

  return pages;
}

function main() {
  console.log('🚀 Starting Programmatic SEO generation...');
  
  // Clean and create output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const pages = generatePages();
  console.log(`📄 Generating ${pages.length} pages...`);

  const sitemapUrls = [];
  const today = new Date().toISOString().split('T')[0];

  for (const page of pages) {
    const pageDir = path.join(OUTPUT_DIR, page.slug);
    fs.mkdirSync(pageDir, { recursive: true });
    
    const relatedLinks = getRelatedLinks(page.slug, pages, 5);
    const html = generatePageHTML(page.content, page.slug, relatedLinks);
    
    fs.writeFileSync(path.join(pageDir, 'index.html'), html);
    
    sitemapUrls.push(`  <url>
    <loc>${BASE_URL}/p/${page.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  // Generate sitemap-programmatic.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);

  console.log(`✅ Generated ${pages.length} pages`);
  console.log(`✅ Sitemap: ${sitemapUrls.length} URLs`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main();
