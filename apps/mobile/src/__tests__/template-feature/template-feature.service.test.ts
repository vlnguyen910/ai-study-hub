import {
  fetchTemplateFeatureItems,
  TemplateFeatureServiceError,
  type ApiClient,
} from "@/features/template-feature/services/template-feature.service";

describe("template-feature.service", () => {
  it("returns normalized items when API response is valid", async () => {
    const clientMock = {
      get: jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              id: "item-1",
              title: "Item One",
              description: "Description One",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
      }),
    } as ApiClient;

    const items = await fetchTemplateFeatureItems(clientMock);

    expect(clientMock.get).toHaveBeenCalledTimes(1);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("item-1");
  });

  it("throws service error when API response is not ok", async () => {
    const clientMock = {
      get: jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { status: 500 },
      }),
    } as ApiClient;

    await expect(fetchTemplateFeatureItems(clientMock)).rejects.toBeInstanceOf(
      TemplateFeatureServiceError,
    );
  });
});
