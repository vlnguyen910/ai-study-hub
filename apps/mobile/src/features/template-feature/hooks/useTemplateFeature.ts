import { useCallback, useMemo, useState } from "react";
import {
  fetchTemplateFeatureItems,
  TemplateFeatureServiceError,
} from "@/features/template-feature/services/template-feature.service";
import type {
  FetchTemplateFeatureItems,
  TemplateFeatureState,
} from "../types/template.types";

const initialState: TemplateFeatureState = {
  items: [],
  isLoading: false,
  errorMessage: null,
};

export const useTemplateFeature = (
  fetcher: FetchTemplateFeatureItems = fetchTemplateFeatureItems,
) => {
  const [state, setState] = useState<TemplateFeatureState>(initialState);

  const loadItems = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      errorMessage: null,
    }));

    try {
      const items = await fetcher();
      setState({
        items,
        isLoading: false,
        errorMessage: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof TemplateFeatureServiceError
          ? error.message
          : "Đã xảy ra lỗi không mong muốn";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage,
      }));
    }
  }, [fetcher]);

  const hasData = useMemo(() => state.items.length > 0, [state.items.length]);

  return {
    ...state,
    hasData,
    loadItems,
  };
};
