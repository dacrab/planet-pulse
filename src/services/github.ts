import { API_CONFIG } from '../config/api';
import { GitHubEvent } from '../types/events';
import { fetchWithTimeout, APIError } from './base';

export async function fetchGitHub(): Promise<GitHubEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.github.url);
    const data = await response.json();

    return data.slice(0, 30).map((event: any) => ({
      id: event.id,
      source: 'github' as const,
      timestamp: new Date(event.created_at).getTime(),
      type: event.type,
      repo: event.repo.name,
      actor: event.actor.login,
      action: getEventAction(event),
    }));
  } catch (error) {
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch GitHub events',
      undefined,
      'github'
    );
  }
}

function getEventAction(event: any): string {
  switch (event.type) {
    case 'PushEvent':
      return `pushed ${event.payload.commits?.length || 0} commits`;
    case 'CreateEvent':
      return `created ${event.payload.ref_type}`;
    case 'IssuesEvent':
      return `${event.payload.action} issue`;
    case 'PullRequestEvent':
      return `${event.payload.action} PR`;
    case 'WatchEvent':
      return 'starred';
    case 'ForkEvent':
      return 'forked';
    default:
      return event.type.replace('Event', '').toLowerCase();
  }
}
