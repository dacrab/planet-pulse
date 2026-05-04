import { API_CONFIG } from '../config/api';
import { NewsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchNews(): Promise<NewsEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.news.url);
    const data = await response.json();

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
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch news');
  }
}
