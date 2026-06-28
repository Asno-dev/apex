export interface ProviderConfig {
  id: string;
  name: string;
  type: string;
  defaultBaseUrl?: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const loadProviderConfig = (): Record<string, ProviderConfig> => {
  const stored = localStorage.getItem('ai_provider_configs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
};

export const saveProviderConfig = (configs: Record<string, ProviderConfig>) => {
  localStorage.setItem('ai_provider_configs', JSON.stringify(configs));
};

export const loadActiveProviderId = (): string => {
  return localStorage.getItem('ai_active_provider_id') || 'google';
};

export const saveActiveProviderId = (id: string) => {
  localStorage.setItem('ai_active_provider_id', id);
};
