import { API_CONFIG } from '../config/api';
import { NewsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

// ok.surf: free, no key, no rate limit, CORS-enabled Google News API
interface NewsItem {
  title?: string;
  source?: string;
  link?: string;
  og?: string;
}

function isNewsItem(raw: unknown): raw is NewsItem {
  return typeof raw === 'object' && raw !== null;
}

export async function fetchNews(): Promise<NewsEvent[]> {
  const res = await fetchWithTimeout(API_CONFIG.news.url);
  const data: unknown = await res.json();
  const articles: NewsEvent[] = [];
  let i = 0;
  for (const section of Object.values(data ?? {})) {
    if (!Array.isArray(section)) continue;
    for (const raw of section) {
      if (!isNewsItem(raw) || typeof raw.title !== 'string') continue;
      articles.push({
        id: `news-${i++}`,
        source: 'news',
        timestamp: Date.now(), // ok.surf doesn't provide pub dates
        title: raw.title,
        description: raw.source ?? '',
        url: typeof raw.link === 'string' ? raw.link : '',
        source_name: raw.source ?? 'Google News',
        image: typeof raw.og === 'string' && raw.og.startsWith('http') ? raw.og : undefined,
      });
      if (articles.length >= 20) return articles;
    }
  }
  return articles;
}
