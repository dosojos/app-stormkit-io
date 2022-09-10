import api from "~/utils/api/Api";

interface InsertRepoProps {
  provider: Provider;
  repo: string;
}

export const insertRepo = ({ provider, repo }: InsertRepoProps) => {
  return api.post<{ app: App }>("/app", { provider, repo }).then(({ app }) => {
    return app;
  });
};
