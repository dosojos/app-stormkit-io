import { RenderResult, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { fireEvent, render } from "@testing-library/react";
import { EnvironmentContext } from "~/pages/apps/[id]/environments/Environment.context";
import { AppContext } from "~/pages/apps/[id]/App.context";
import mockApp from "~/testing/data/mock_app";
import mockEnvironments from "~/testing/data/mock_environments";
import EnvironmentConfig from "./EnvironmentConfig";

interface WrapperProps {
  app?: App;
  environments?: Environment[];
  hash?: string;
  setRefreshToken?: () => void;
}

describe("~/pages/apps/[id]/environments/[env-id]/config/EnvironmentConfig.tsx", () => {
  let wrapper: RenderResult;
  let currentApp: App;
  let currentEnv: Environment;
  let currentEnvs: Environment[];

  const createWrapper = ({
    app,
    environments,
    hash,
    setRefreshToken = () => {},
  }: WrapperProps) => {
    currentApp = app || mockApp();
    currentEnvs = environments || mockEnvironments({ app: currentApp });
    currentEnv = currentEnvs[0];

    wrapper = render(
      <MemoryRouter initialEntries={[`/${hash}`]}>
        <AppContext.Provider
          value={{
            app: currentApp,
            environments: currentEnvs,
            setRefreshToken,
          }}
        >
          <EnvironmentContext.Provider value={{ environment: currentEnv }}>
            <EnvironmentConfig />
          </EnvironmentContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    );
  };

  test("should default to the #general tab", () => {
    createWrapper({});

    expect(wrapper.getByText("General settings")).toBeTruthy();

    expect(wrapper.getByLabelText("Environment name")).toBeTruthy();
    expect(wrapper.getByDisplayValue(currentEnv.name)).toBeTruthy();

    expect(wrapper.getByLabelText("Branch")).toBeTruthy();
    expect(wrapper.getByDisplayValue(currentEnv.branch)).toBeTruthy();

    expect(wrapper.getByLabelText("Auto publish")).toBeTruthy();
    expect(wrapper.getByLabelText("Auto deploy")).toBeTruthy();
  });

  test("should contain tabs to switch views", () => {
    createWrapper({});
    expect(wrapper.getByText("General")).toBeTruthy();
    expect(wrapper.getByText("Build")).toBeTruthy();
    expect(wrapper.getByText("Environment variables")).toBeTruthy();
    expect(wrapper.getByText("API Keys")).toBeTruthy();
    expect(wrapper.getByText("Custom storage")).toBeTruthy();
  });

  test.each`
    hash          | expectedString
    ${"#general"} | ${"Use these settings to configure your environment details."}
    ${"#vars"}    | ${"These variables will be available to build time and Functions runtime."}
    ${"#build"}   | ${"Use these settings to configure your build options."}
    ${"#api"}     | ${"This key will allow you to interact with our API and modify this environment."}
  `(
    "should load different tab based on hash: $hash",
    ({ hash, expectedString }) => {
      createWrapper({ hash });
      expect(wrapper.getByText(expectedString)).toBeTruthy();
    }
  );

  test("should switch between tabs", async () => {
    createWrapper({});

    fireEvent.click(wrapper.getByText("Environment variables"));
    expect(window.location.hash).toBe("");

    await waitFor(() => {
      expect(window.location.hash).toBe("#vars");
    });
  });
});
