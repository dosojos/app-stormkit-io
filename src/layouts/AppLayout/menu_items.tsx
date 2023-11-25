import RocketLaunch from "@mui/icons-material/RocketLaunch";
import Construction from "@mui/icons-material/Construction";
import Code from "@mui/icons-material/Code";
import Tour from "@mui/icons-material/Tour";
import Update from "@mui/icons-material/Update";
import Database from "@mui/icons-material/Storage";
import Terminal from "@mui/icons-material/Terminal";

export const appMenuItems = ({
  app,
  pathname,
}: {
  app: App;
  pathname: string;
}): Path[] => [
  {
    // List environments
    path: `/apps/${app.id}/environments`,
    text: "Environments",
    isActive: pathname.includes("/environments"),
  },
  {
    // List settings
    path: `/apps/${app.id}/settings`,
    text: "Settings",
    isActive: pathname.endsWith("/settings"),
  },
];

interface Path {
  path: string;
  icon?: React.ReactNode;
  text: React.ReactNode;
  isActive?: boolean;
}

export const envMenuItems = ({
  app,
  env,
  pathname,
}: {
  app: App;
  env: Environment;
  pathname: string;
}): Path[] => {
  if (!env) {
    return [];
  }

  const envPath = `/apps/${app.id}/environments/${env.id}`;

  const items = [
    {
      icon: <Construction />,
      text: "Config",
      path: envPath,
      isActive: pathname === envPath,
    },
    {
      path: `${envPath}/deployments`,
      text: "Deployments",
      icon: <RocketLaunch />,
      isActive:
        pathname.includes("/deployments") && !pathname.includes("runtime-logs"),
    },
    {
      icon: <Code />,
      text: "Snippets",
      path: `${envPath}/snippets`,
      isActive: pathname.includes("/snippets"),
    },
    {
      icon: <Tour />,
      text: "Feature Flags",
      path: `${envPath}/feature-flags`,
      isActive: pathname.includes("/feature-flags"),
    },
  ];

  items.push({
    icon: <Update />,
    text: "Triggers",
    path: `${envPath}/function-triggers`,
    isActive: pathname.includes("/function-triggers"),
  });

  if (app.featureFlags?.SK_DATA_STORE) {
    items.push({
      icon: <Database />,
      text: "Data Store",
      path: `${envPath}/data-store`,
      isActive: pathname.includes("/data-store"),
    });
  }

  if (env.published?.length) {
    items.push({
      icon: <Terminal />,
      text: "Runtime logs",
      path: `${envPath}/deployments/${env.published[0].deploymentId}/runtime-logs`,
      isActive: pathname.includes("/runtime-logs"),
    });
  }

  return items;
};
