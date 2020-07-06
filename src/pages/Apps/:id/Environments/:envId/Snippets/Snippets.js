import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "~/utils/context";
import RootContext from "~/pages/Root.context";
import AppsContext from "~/pages/Apps/Apps.context";
import EnvironmentContext from "~/pages/Apps/:id/Environments/:envId/Environment.context";
import ExplanationBox from "~/components/ExplanationBox";
import Spinner from "~/components/Spinner";
import InfoBox from "~/components/InfoBox";
import Button from "~/components/Button";
import { PlusButton } from "~/components/Buttons";
import { useFetchSnippets } from "./actions";
import SnippetModal from "./_components/SnippetModal";
import SnippetTable from "./_components/SnippetTable";

const Snippets = ({ api, app, environment: env, toggleModal, location }) => {
  const fetchOpts = { api, app, env, location };
  const { loading, error, snippets, setSnippets } = useFetchSnippets(fetchOpts);
  const [selectedSnippet, setSelectedSnippet] = useState();
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    setSelectedSnippet();
  }, [snippets]);

  return (
    <div className="flex flex-col mt-4">
      <div className="flex bg-white rounded mb-4 p-8 items-center">
        <h2 className="text-lg font-bold flex flex-auto">
          Snippets
          <Button
            styled={false}
            className="fas fa-question-circle ml-2"
            onClick={() => setIsHover(!isHover)}
          />
        </h2>
        <div className="flex-shrink-0">
          <PlusButton
            size="small"
            onClick={() => {
              setSelectedSnippet();
              toggleModal(true);
            }}
            className="p-2 rounded"
          />
        </div>
      </div>
      <div className="flex flex-auto rounded">
        {loading && (
          <div
            data-testid="snippets-spinner"
            className="p-8 flex items-center w-full bg-white rounded"
          >
            <Spinner primary />
          </div>
        )}
        {!loading && error && <InfoBox type={InfoBox.ERROR}>{error}</InfoBox>}
        {!loading && (
          <div className="w-full relative">
            {isHover && (
              <ExplanationBox
                title="Inject snippets"
                className="shadow-lg min-w-72 max-w-72 -mt-4 -ml-2"
                absolute
              >
                <p>
                  Snippets help you to maintain 3rd party code in your
                  application. <br /> <br />
                  The codes specified here will be injected during response time
                  to your document. You can enable or disable any snippet
                  without the need of a deployment.
                </p>
              </ExplanationBox>
            )}
            <SnippetModal
              snippets={snippets}
              setSnippets={setSnippets}
              snippet={selectedSnippet}
            />
            <SnippetTable
              snippets={snippets}
              api={api}
              app={app}
              environment={env}
              setSnippets={setSnippets}
              setSelectedSnippet={(...args) => {
                setSelectedSnippet(...args);
                toggleModal(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

Snippets.propTypes = {
  api: PropTypes.object,
  app: PropTypes.object,
  environment: PropTypes.object,
  toggleModal: PropTypes.func,
  location: PropTypes.object,
};

export default connect(Snippets, [
  { Context: RootContext, props: ["api"] },
  { Context: AppsContext, props: ["app"] },
  { Context: EnvironmentContext, props: ["environment"] },
  { Context: SnippetModal, props: ["toggleModal"], wrap: true },
]);
