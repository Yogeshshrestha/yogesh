/**
 * Generates public/sitemap.xml before build.
 * Run automatically via: npm run build
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SITE_URL = 'https://yogeshshrestha9.com.np';
const lastmod = new Date().toISOString().split('T')[0];

const pages = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
];

const urls = pages
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, '..', 'public', 'sitemap.xml');

writeFileSync(output, sitemap, 'utf8');
console.log(`✓ sitemap.xml generated → ${output}`);
