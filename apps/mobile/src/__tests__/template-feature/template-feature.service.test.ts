import {
  fetchTemplateFeatureItems,
  TemplateFeatureServiceError,
} from "@/features/template-feature/services/template-feature.service";

describe("template-feature.service", () => {
  it("returns normalized items when API response is valid", async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: "item-1",
            title: "Item One",
            description: "Description One",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const items = await fetchTemplateFeatureItems(fetchMock);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("item-1");
  });

  it("throws service error when API response is not ok", async () => {
    const fetchMock = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    await expect(fetchTemplateFeatureItems(fetchMock)).rejects.toBeInstanceOf(
      TemplateFeatureServiceError,
    );
  });
});
