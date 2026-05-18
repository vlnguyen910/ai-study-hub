import { render } from "@testing-library/react-native";
import { Text } from "react-native";

describe("smoke", () => {
  it("renders text", () => {
    const { getByText } = render(<Text>Hello, Expo</Text>);
    expect(getByText("Hello, Expo")).toBeTruthy();
  });
});
