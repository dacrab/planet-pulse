import { NewsEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchNews } from '../services/news';
import { API_CONFIG } from '../config/api';
import { createPollingStore } from './polling-factory';

export function createNewsStore(): PollingStore<NewsEvent> {
  return createPollingStore(fetchNews, API_CONFIG.news.interval);
}
