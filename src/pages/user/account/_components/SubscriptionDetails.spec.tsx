import type { RenderResult } from "@testing-library/react";
import { render, waitFor } from "@testing-library/react";
import { mockFetchLicense } from "~/testing/nocks/nock_user";
import SubscriptionDetails from "./SubscriptionDetails";
import mockUser from "~/testing/data/mock_user";

interface Props {
  user: User;
}

describe("~/pages/user/account/_components/SubscriptionDetails", () => {
  let wrapper: RenderResult;

  const createWrapper = ({ user }: Props) => {
    wrapper = render(<SubscriptionDetails user={user} />);
  };

  describe("when the user is still in free trial", () => {
    beforeEach(() => {
      const user = mockUser({ packageId: "free" });

      createWrapper({
        user,
      });
    });

    test("should display the checkout form", () => {
      expect(wrapper.getByText("Cloud Edition")).toBeTruthy();
      expect(wrapper.getByText("Self-Hosted Edition")).toBeTruthy();
    });

    test("should display a checkout title", () => {
      expect(wrapper.getByText("Checkout")).toBeTruthy();
      expect(() => wrapper.getByText("Subscription Details")).toThrow();
    });
  });

  describe("when the user is a cloud-edition", () => {
    beforeEach(() => {
      const user = mockUser({ packageId: "medium" });

      createWrapper({
        user,
      });
    });

    test("should no longer display the checkout form", () => {
      expect(() => wrapper.getByText("Cloud Edition")).toThrow();
      expect(() => wrapper.getByText("Self-Hosted Edition")).toThrow();
    });

    test("should no longer display a checkout title", () => {
      expect(() => wrapper.getByText("Checkout")).toThrow();
    });

    test("should display the subscription details title", () => {
      expect(wrapper.getByText("Subscription Details")).toBeTruthy();
    });
  });

  describe("when the user is a self-edition", () => {
    beforeEach(async () => {
      const user = mockUser({ packageId: "self-hosted" });
      const scope = mockFetchLicense({
        status: 200,
        response: { license: { key: "abc", premium: true, seat: 6 } },
      });

      createWrapper({
        user,
      });

      await waitFor(() => {
        expect(scope.isDone()).toBe(true);
      });
    });

    test("should no longer display the checkout form", () => {
      expect(() => wrapper.getByText("Cloud Edition")).toThrow();
      expect(() => wrapper.getByText("Self-Hosted Edition")).toThrow();
    });

    test("should no longer display a checkout title", () => {
      expect(() => wrapper.getByText("Checkout")).toThrow();
    });

    test("should display the subscription details title", () => {
      expect(wrapper.getByText("Subscription Details")).toBeTruthy();
    });

    test("should display the liceense", () => {
      expect(wrapper.getByText(/STORMKIT_LICENSE/)).toBeTruthy();
      expect(wrapper.getByDisplayValue("abc")).toBeTruthy();
    });
  });
});
