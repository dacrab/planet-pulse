import { API_CONFIG } from '../config/api';
import { NewsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchNews(): Promise<NewsEvent[]> {
  const res = await fetchWithTimeout(API_CONFIG.news.url, {
    headers: { 'User-Agent': 'planet-pulse/1.0' },
  });
  const data = await res.json();
  if (!data.data?.children) return [];
  return data.data.children.slice(0, 20).map((item: any) => ({
    id: item.data.id,
    source: 'news' as const,
    timestamp: item.data.created_utc * 1000,
    title: item.data.title,
    description: item.data.selftext?.substring(0, 200) || '',
    url: item.data.url,
    source_name: item.data.subreddit_name_prefixed,
    image: item.data.thumbnail?.startsWith('http') ? item.data.thumbnail : undefined,
  }));
}
