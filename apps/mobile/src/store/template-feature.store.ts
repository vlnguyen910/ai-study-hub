import { useSyncExternalStore } from "react";

interface TemplateFeatureStoreState {
  selectedItemId: string | null;
}

const defaultState: TemplateFeatureStoreState = {
  selectedItemId: null,
};

let storeState: TemplateFeatureStoreState = defaultState;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => storeState;

export const setTemplateFeatureSelectedItemId = (itemId: string | null) => {
  storeState = {
    ...storeState,
    selectedItemId: itemId,
  };
  notify();
};

export const resetTemplateFeatureStore = () => {
  storeState = defaultState;
  notify();
};

export const useTemplateFeatureStore = (): TemplateFeatureStoreState => {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
