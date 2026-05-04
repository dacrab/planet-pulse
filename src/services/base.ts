export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public source?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof APIError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout');
    }
    throw new APIError(error instanceof Error ? error.message : 'Unknown error');
  }
}
