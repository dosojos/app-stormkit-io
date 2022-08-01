import React from "react";
import { Redirect, useLocation} from "react-router-dom";
import qs from "query-string";
import { connect } from "~/utils/context";
import CenterLayout from "~/layouts/CenterLayout";
import Logo from "~/components/Logo";
import AuthContext from "./Auth.context";
import OauthLogin from "./_components/OauthLogin";
import "./Auth.css";
import { LocalStorage } from "~/utils/storage";


interface ContextProps {
  user: User;
}

const Auth: React.FC<ContextProps> = ({ user }): React.ReactElement => {
  const location = useLocation();

  if (user) {
    const { redirect = "/" } = qs.parse(location.search.replace("?", ""));

    if (typeof redirect === "string") {
      return <Redirect to={redirect} />;
    }
  }


  const queryString = location.search;
  const urlParams = new URLSearchParams(queryString);
  const referral = urlParams.get('referral')
  if (referral !== null) {
    // set cookie for a week
    LocalStorage.set("referral", referral)
  }



  return (
    <CenterLayout>
      <div className="mb-16 text-center pt-6 sm:pt-0">
        <Logo />
      </div>
      <div className="flex flex-col-reverse sm:flex-row px-6">
        <div className="flex flex-col text-white sm:max-w-sm sm:mr-16 pt-12 mb-4 sm:mb-0">
          <p className="leading-loose text-lg">
            /def/ <span className="text-pink-50">Noun.</span>
            <br />
            1. Serverless CI Platform.
            <br />
            2. A set of tools built to save dev-ops time for your Javascript
            application.
          </p>
          <ul className="p-4 bg-white-o-05 mt-8 rounded leading-loose">
            <li>
              <i className="fas fa-undo-alt mr-4" /> Environments with instant
              rollbacks
            </li>
            <li>
              <i className="fas fa-shield-alt mr-4" /> Custom domains &amp; SSL
            </li>
            <li>
              <i className="fas fa-robot mr-4" /> Support for Server-Side
              Rendering
            </li>
          </ul>
        </div>
        <div className="auth-box bg-white rounded p-6 sm:p-12">
          <h1 className="text-pink-50 font-bold text-2xl">Authentication</h1>
          <p className="mt-4 mb-12 text-base">
            Log in with your favorite provider
          </p>
          <OauthLogin />
        </div>
      </div>
    </CenterLayout>
  );
};

export default connect<unknown, ContextProps>(Auth, [
  { Context: AuthContext, props: ["user"] },
]);
