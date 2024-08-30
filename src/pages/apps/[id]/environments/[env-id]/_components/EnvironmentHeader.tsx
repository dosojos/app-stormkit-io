import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InfoIcon from "@mui/icons-material/Info";
import Card from "~/components/Card";
import DeployButton from "~/layouts/AppLayout/_components/DeployButton";
import { EnvironmentContext } from "~/pages/apps/[id]/environments/Environment.context";
import { AppContext } from "~/pages/apps/[id]/App.context";
import { useFetchStatus, isEmpty } from "../../actions";
import DomainStatus from "./DomainStatus";

interface ColumnProps {
  children: React.ReactNode;
}

function Column({ children }: ColumnProps) {
  return (
    <Box
      sx={{
        pr: 2,
        mr: 2,
        pb: { xs: 1, md: 0 },
        mb: { xs: 1, md: 0 },
        width: { xs: "100%", md: "auto" },
        borderRight: { xs: "none", md: "1px solid rgba(255,255,255,0.1)" },
        borderBottom: { xs: "1px solid rgba(255,255,255,0.05)", md: "none" },
      }}
    >
      {children}
    </Box>
  );
}

export default function EnvironmentHeader() {
  const { environments } = useContext(AppContext);
  const { environment } = useContext(EnvironmentContext);
  const { app } = useContext(AppContext);
  const domainName = environment.preview;

  const { status, loading } = useFetchStatus({
    environment,
    domain: domainName,
    app,
  });

  return (
    <Card sx={{ width: "100%", mb: 2 }}>
      <Box
        fontSize="small"
        sx={{
          width: "100%",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Column>
          <DomainStatus loading={loading} status={status} />
        </Column>
        <Column>
          <Link href={domainName}>
            {domainName.replace(/^https?:\/\//, "")}
          </Link>
        </Column>
        <Column>
          <span className="fa fa-code-branch mr-2" />
          <Typography component="span">{environment.branch}</Typography>
        </Column>
        <Box sx={{ flex: 1 }}>
          {!environment.lastDeploy?.id ? (
            <>
              <Tooltip
                title={"Deploy your app to start serving your application."}
                placement="bottom"
                arrow
              >
                <Typography component="span">
                  <InfoIcon sx={{ mr: 1 }} />
                  Not yet deployed
                </Typography>
              </Tooltip>
            </>
          ) : !environment.published ? (
            <>
              <Tooltip
                title={"Publish a deployment to serve your app."}
                placement="bottom"
                arrow
              >
                <span className="fas fa-info-circle mr-2 text-xl" />
              </Tooltip>
              Not yet published
            </>
          ) : (
            <Box
              sx={{
                mr: 2,
                mb: { xs: 2, md: 0 },
                width: { xs: "100%", md: "auto" },
                flex: 1,
              }}
            >
              <Typography component="span">Published</Typography>
              {!isEmpty(environment.published) &&
                Array.isArray(environment.published) && (
                  <>
                    :{" "}
                    {environment.published.length > 1 ? (
                      "multiple deployments"
                    ) : (
                      <Link
                        key={environment.published[0].deploymentId}
                        href={`/apps/${environment.appId}/environments/${environment.id}/deployments/${environment.published[0].deploymentId}`}
                      >
                        {environment.published[0].deploymentId}
                      </Link>
                    )}
                    {status?.toString()[0] !== "2" && (
                      <Tooltip
                        title={
                          <Box sx={{ p: 2 }}>
                            <Typography className="text-center">
                              The endpoint returns 404.
                              <br />
                              Click on{" "}
                              {environment.published?.length > 1
                                ? "a"
                                : "the"}{" "}
                              deployment to debug.
                            </Typography>
                            {environment.published?.map(p => (
                              <Box
                                sx={{
                                  textAlign: "center",
                                  mt: 2,
                                }}
                                key={p.deploymentId}
                              >
                                <Button variant="contained" color="secondary">
                                  #{p.deploymentId}
                                </Button>
                              </Box>
                            ))}
                          </Box>
                        }
                      >
                        <Box
                          component="span"
                          sx={{ ml: 1 }}
                          className="fas fa-triangle-exclamation"
                          aria-label="Deployment not found"
                        />
                      </Tooltip>
                    )}
                  </>
                )}
            </Box>
          )}
        </Box>
        <Box sx={{ width: { xs: "100%", md: "auto" } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <DeployButton
              app={app}
              environments={environments}
              selectedEnvId={environment.id!}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
