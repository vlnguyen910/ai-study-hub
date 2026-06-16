import {
  fetchMyProfile,
  updateProfile,
  type ProfileApiClient,
} from "@/features/profile/services/profile.service";

const createClientMock = (): jest.Mocked<ProfileApiClient> => ({
  get: jest.fn(),
  patch: jest.fn(),
});

describe("profile.service", () => {
  it("fetches the authenticated account profile", async () => {
    const client = createClientMock();
    const response = {
      id: "acc-1",
      email: "student@example.com",
      name: "Nguyen Student",
      avatarUrl: "",
    };
    client.get.mockResolvedValue({ data: { data: response } });

    await expect(fetchMyProfile(client)).resolves.toBe(response);

    expect(client.get).toHaveBeenCalledWith("/api/v1/accounts/me");
  });

  it("updates profile fields on the authenticated account", async () => {
    const client = createClientMock();
    const payload = {
      name: "Updated Student",
      avatarUrl: "https://example.com/avatar.png",
    };
    const response = {
      id: "acc-1",
      email: "student@example.com",
      ...payload,
    };
    client.patch.mockResolvedValue({ data: { data: response } });

    await expect(updateProfile("acc-1", payload, client)).resolves.toBe(
      response,
    );

    expect(client.patch).toHaveBeenCalledWith(
      "/api/v1/accounts/acc-1",
      payload,
    );
  });
});
