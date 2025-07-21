const API_BASE_URL = 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  include_sources?: boolean;
}

export interface ChatResponse {
  answer: string;
  question: string;
  timestamp: number;
  sources?: Source[];
  error?: boolean;
}

export interface Source {
  content: string;
  metadata: Record<string, any>;
  type: string;
  source: string;
}

export interface SearchRequest {
  query: string;
  k?: number;
}

export interface SearchResponse {
  documents: Document[];
  query: string;
}

export interface Document {
  content: string;
  metadata: Record<string, any>;
  type: string;
  source: string;
}

export interface StatsResponse {
  index_name: string;
  total_vector_count: number;
  dimension: number;
  namespaces: Record<string, any>;
  index_fullness: number;
}

export interface HistoryResponse {
  history: Array<{
    role: string;
    content: string;
  }>;
}

export interface HealthResponse {
  status: string;
  agent_initialized: boolean;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats');
  }

  async getHistory(): Promise<HistoryResponse> {
    return this.request<HistoryResponse>('/history');
  }

  async clearHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/history', {
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient();