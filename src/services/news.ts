import { NewsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

// ok.surf: free, no key, no rate limit, CORS-enabled Google News API
const URL = 'https://ok.surf/api/v1/cors/news-feed';

export async function fetchNews(): Promise<NewsEvent[]> {
  const res = await fetchWithTimeout(URL);
  const data = await res.json();
  const articles: NewsEvent[] = [];
  let i = 0;
  for (const section of Object.values(data) as any[][]) {
    for (const item of section) {
      articles.push({
        id: `news-${i++}`,
        source: 'news',
        timestamp: Date.now(), // ok.surf doesn't provide pub dates
        title: item.title,
        description: item.source ?? '',
        url: item.link,
        source_name: item.source ?? 'Google News',
        image: item.og?.startsWith('http') ? item.og : undefined,
      });
      if (articles.length >= 20) return articles;
    }
  }
  return articles;
}
