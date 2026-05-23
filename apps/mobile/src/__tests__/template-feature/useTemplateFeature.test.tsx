import { act, renderHook } from "@testing-library/react-native";
import { useTemplateFeature } from "@/features/template-feature/hooks/useTemplateFeature";
import { TemplateFeatureServiceError } from "@/features/template-feature/services/template-feature.service";

describe("useTemplateFeature", () => {
  it("loads items successfully", async () => {
    const fetcher = jest.fn(async () => [
      {
        id: "item-1",
        title: "Item One",
        description: "Description One",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useTemplateFeature(fetcher));

    await act(async () => {
      await result.current.loadItems();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.hasData).toBe(true);
  });

  it("sets error message when service throws", async () => {
    const fetcher = jest.fn(async () => {
      throw new TemplateFeatureServiceError("Service failed", 500);
    });

    const { result } = renderHook(() => useTemplateFeature(fetcher));

    await act(async () => {
      await result.current.loadItems();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.errorMessage).toBe("Service failed");
  });
});
