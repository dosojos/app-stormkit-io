import type { FormValues, AutoDeployValues } from "../actions";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import cn from "classnames";
import Box from "@mui/material/Box";
import TextInput from "@mui/material/Input";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Container from "~/components/Container";
import ContainerV2 from "~/components/ContainerV2";
import ConfirmModal from "~/components/ConfirmModal";
import Form from "~/components/FormV2";
import Link from "~/components/Link";
import Button from "~/components/ButtonV2";
import InfoBox from "~/components/InfoBoxV2";
import Spinner from "~/components/Spinner";
import { useFetchRepoMeta, deleteEnvironment } from "../actions";
import { isFrameworkRecognized } from "../helpers";

const computeAutoDeployValue = (env?: Environment): AutoDeployValues => {
  if (!env) {
    return "all";
  }

  return env?.autoDeploy
    ? !env?.autoDeployBranches
      ? "all"
      : "custom"
    : "disabled";
};

export interface FormHandlerProps {
  values: FormValues;
  setLoading: (val: boolean) => void;
  setSuccess: (val: boolean) => void;
  setError: (val: string | undefined) => void;
}

interface Props {
  formHandler: (props: FormHandlerProps) => void;
  onCancel?: () => void;
  setRefreshToken?: (val: number) => void;
  environment?: Environment;
  title?: string;
  app: App;
}

const EnvironmentForm: React.FC<Props> = ({
  app,
  environment: env,
  formHandler,
  onCancel,
  setRefreshToken,
  title = "Environment details",
}) => {
  const navigate = useNavigate();
  const { meta, loading, error } = useFetchRepoMeta({ app, env });
  const [envVarsMode, setEnvVarsMode] = useState<"textarea" | "keyvalue">(
    "textarea"
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAutoPublish, setIsAutoPublish] = useState(env?.autoPublish || false);
  const [keyValueResetToken, setKeyValueResetToken] = useState<number>();
  const [isChanged, setIsChanged] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const [autoDeploy, setAutoDeploy] = useState<AutoDeployValues>(
    computeAutoDeployValue(env)
  );

  useEffect(() => {
    if (saveError || saveSuccess) {
      document
        .getElementById("env-form-save")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [saveError, saveSuccess]);

  return (
    <Form<FormValues>
      id="env-config-form"
      className="text-gray-80"
      handleSubmit={values => {
        if (!isChanged) {
          return;
        }

        setIsChanged(false);

        formHandler({
          values,
          setLoading: setSaveLoading,
          setError: setSaveError,
          setSuccess: setSaveSuccess,
        });
      }}
    >
      {error === "403" && (
        <InfoBox type={InfoBox.WARNING} className="mb-4">
          Repository is not connected to provider. See the{" "}
          <Link
            className="font-bold hover:text-white hover:underline"
            to="https://www.stormkit.io/docs/troubleshooting#repository-is-innaccessible"
          >
            troubleshooting
          </Link>{" "}
          for help.
        </InfoBox>
      )}
      {error !== "403" && error && (
        <InfoBox type={InfoBox.WARNING} className="mb-4">
          {error}
        </InfoBox>
      )}
      <Container title={title} maxWidth="max-w-none">
        <Form.WithLabel label="Name" className="py-0">
          <Form.Input
            defaultValue={env?.name || ""}
            fullWidth
            onChange={() => setIsChanged(true)}
            name="name"
            autoFocus
            className="bg-blue-10 no-border h-full"
          />
        </Form.WithLabel>
        <Form.WithLabel label="Branch" className="pb-0">
          <Form.Input
            defaultValue={env?.branch || ""}
            name="branch"
            onChange={() => setIsChanged(true)}
            className="bg-blue-10 no-border h-full"
            fullWidth
          />
        </Form.WithLabel>
        <Form.WithLabel
          label="Auto publish"
          className="pb-0"
          tooltip="When enabled, successful deployments will be published automatically."
        >
          <div className="bg-blue-10 w-full flex justify-between pr-4 items-center">
            <Form.Switch
              color="secondary"
              onChange={e => {
                setIsChanged(true);
                setIsAutoPublish(e.target.checked);
              }}
              checked={isAutoPublish}
              name="autoPublish"
            />
          </div>
        </Form.WithLabel>
        <Form.WithLabel
          label="Auto deploy"
          className={cn({ "pb-0": autoDeploy === "custom" })}
        >
          <div className="bg-blue-10 w-full h-full">
            <Form.Select
              name="autoDeploy"
              value={autoDeploy}
              className="no-border h-full"
              onChange={e => {
                setAutoDeploy(e.target.value as AutoDeployValues);
                setIsChanged(true);
              }}
            >
              <Form.Option value="disabled">Disabled</Form.Option>
              <Form.Option value="all">All branches</Form.Option>
              <Form.Option value="custom">Custom branches</Form.Option>
            </Form.Select>
          </div>
        </Form.WithLabel>
        {autoDeploy === "custom" && (
          <Form.WithLabel
            label="Custom branches"
            tooltip={
              <div>
                <h3 className="mb-4 font-bold">Examples</h3>
                <ol>
                  <li className="mb-2">
                    <code className="text-white mr-2">^(?!dependabot).+</code>{" "}
                    Match anything that does not start with <b>dependabot</b>
                  </li>
                  <li className="mb-2">
                    <code className="text-white mr-2">^release-.+</code>
                    Match anything that starts with <b>release-</b>
                  </li>
                </ol>
              </div>
            }
          >
            <Form.Input
              name="autoDeployBranches"
              defaultValue={env?.branch || ""}
              className="bg-blue-10 no-border h-full"
              onChange={() => setIsChanged(true)}
              InputProps={{
                endAdornment: <code className="ml-1 text-pink-50">/i</code>,
                startAdornment: <code className="mr-1 text-pink-50">/</code>,
              }}
              fullWidth
            />
          </Form.WithLabel>
        )}
      </Container>
      <>
        <Container
          title="Build configuration"
          className="my-4"
          maxWidth="max-w-none"
        >
          <Form.WithLabel
            label="Build command"
            className="pt-0"
            tooltip="Concatenate multiple commands with the logical `&&` operator (e.g. npm run test && npm run build)"
          >
            <Form.Input
              defaultValue={env?.build.cmd || ""}
              fullWidth
              name="build.cmd"
              onChange={() => setIsChanged(true)}
              placeholder="Defaults to 'npm run build' or 'yarn build' or 'pnpm build'"
              className="bg-blue-10 no-border h-full"
            />
          </Form.WithLabel>
          <Form.WithLabel
            label="Output folder"
            className="pt-0"
            tooltip={
              !loading &&
              !isFrameworkRecognized(meta?.framework) &&
              "The folder where the build artifacts are located."
            }
          >
            {!loading && isFrameworkRecognized(meta?.framework) ? (
              <div className="opacity-50 cursor-not-allowed p-2">
                <span className="fa fa-info-circle mr-2 ml-1" />
                Output folder is not needed. It is taken from the framework
                configuration file.
              </div>
            ) : (
              <Form.Input
                defaultValue={env?.build.distFolder || ""}
                fullWidth
                name="build.distFolder"
                onChange={() => setIsChanged(true)}
                placeholder="Defaults to `build`, `dist`, `output` or `.stormkit`"
                className="bg-blue-10 no-border h-full"
                InputProps={{
                  endAdornment: loading && <Spinner width={4} height={4} />,
                }}
              />
            )}
          </Form.WithLabel>
        </Container>
        <ContainerV2
          title="Environment Variables"
          subtitle="These variables will be made available during build time."
          maxWidth={"none"}
          actions={
            <ToggleButtonGroup
              value={envVarsMode}
              exclusive
              onChange={(_, val) => {
                if (val !== null) {
                  setEnvVarsMode(val as "textarea" | "keyvalue");
                }
              }}
              aria-label="display mode"
            >
              <ToggleButton value="textarea" aria-label="json view">
                <span className="fa-solid fa-code text-gray-80" />
              </ToggleButton>
              <ToggleButton value="keyvalue" aria-label="ui view">
                <span className="fa-solid fa-list text-gray-80" />
              </ToggleButton>
            </ToggleButtonGroup>
          }
        >
          <Box sx={{ p: 2, pt: 0 }}>
            {envVarsMode === "keyvalue" && (
              <Form.KeyValue
                inputName="build.vars"
                keyName="Variable name"
                valName="Value"
                defaultValue={
                  env?.build?.vars || (env ? {} : { NODE_ENV: "development" })
                }
                resetToken={keyValueResetToken}
                onChange={() => setIsChanged(true)}
              />
            )}
            {envVarsMode === "textarea" && (
              <TextInput
                placeholder="NODE_ENV=production"
                sx={{
                  bgcolor: "rgba(0, 0, 0, 0.1)",
                  fontFamily: "monospace",
                  color: "white",
                  p: 2,
                  fontSize: 14,
                  lineHeight: 1.75,
                }}
                fullWidth
                maxRows={20}
                name="build.vars"
                multiline
                onChange={() => {
                  setIsChanged(true);
                }}
                defaultValue={Object.keys(env?.build?.vars || {})
                  .map(key => `${key}=${env?.build.vars[key]}`)
                  .join("\n")}
              />
            )}
          </Box>
        </ContainerV2>
      </>
      {saveError && (
        <InfoBox type={InfoBox.WARNING} className="mt-4">
          {saveError}
        </InfoBox>
      )}
      {saveSuccess && (
        <InfoBox
          type={InfoBox.SUCCESS}
          className="mt-4"
          dismissable
          onDismissed={() => {
            setSaveSuccess(false);
          }}
        >
          Environment saved successfully.
        </InfoBox>
      )}
      <div
        className={cn("mt-4 flex", {
          "justify-end": !env || env.name === "production",
          "justify-between": env && env.name !== "production",
        })}
        id="env-form-save"
      >
        {env && env.name !== "production" && (
          <>
            <Button
              type="button"
              category="button"
              aria-label={`Delete ${env.name} environment`}
              onClick={() => {
                setIsDeleteModalOpen(true);
              }}
            >
              <span>
                Delete <span className="font-bold">{env.name}</span> environment
              </span>
            </Button>
            {isDeleteModalOpen && (
              <ConfirmModal
                onCancel={() => {
                  setIsDeleteModalOpen(false);
                }}
                onConfirm={({ setLoading, setError }) => {
                  setLoading(false);
                  deleteEnvironment({ app, environment: env })
                    .then(() => {
                      setLoading(false);
                      navigate(`/apps/${app.id}/environments`);
                      setRefreshToken?.(Date.now());
                    })
                    .catch(e => {
                      console.error(e);
                      setError(
                        "Something went wrong while deleting environment. Check the console."
                      );
                    });
                }}
              >
                <span className="block">
                  This will completely delete the environment and associated
                  deployments.
                </span>
              </ConfirmModal>
            )}
          </>
        )}
        <div>
          <Button
            type="button"
            category="cancel"
            className="bg-blue-50 mr-4"
            onClick={() => {
              const form = document.getElementById(
                "env-config-form"
              ) as HTMLFormElement;

              setSaveError(undefined);
              setSaveSuccess(false);
              setAutoDeploy(computeAutoDeployValue(env));
              setIsAutoPublish(env?.autoPublish || false);
              setKeyValueResetToken(Date.now());
              form?.reset();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button disabled={!isChanged} loading={saveLoading}>
            Save
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EnvironmentForm;
