export interface TemplateFeatureItem {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

export interface TemplateFeatureResponse {
  items: TemplateFeatureItem[];
}

export interface TemplateFeatureState {
  items: TemplateFeatureItem[];
  isLoading: boolean;
  errorMessage: string | null;
}

export type FetchTemplateFeatureItems = () => Promise<TemplateFeatureItem[]>;
