import { describe, expect, it } from "vitest";

import {
  buildGoogleLoginUrl,
  consumeGoogleAccessTokenFromHash,
} from "./google-auth";

describe("google-auth", () => {
  it("builds an API Google signin URL with device and redirect path", () => {
    expect(
      buildGoogleLoginUrl({
        apiBaseUrl: "http://localhost:8080",
        deviceId: "device-1",
        redirectPath: "/documents",
      }),
    ).toBe(
      "http://localhost:8080/api/v1/auth/google?deviceId=device-1&redirectPath=%2Fdocuments",
    );
  });

  it("consumes access token from the URL fragment", () => {
    expect(
      consumeGoogleAccessTokenFromHash("#googleAccessToken=access-token"),
    ).toBe("access-token");
    expect(consumeGoogleAccessTokenFromHash("#googleError=denied")).toBeNull();
  });
});
