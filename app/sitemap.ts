// Serves /sitemap.xml, which lists the site's one page at its production address for search engines.
// Next.js renders it once at build time.
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/` }];
}
