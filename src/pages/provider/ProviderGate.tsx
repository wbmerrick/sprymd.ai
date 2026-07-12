import { useState } from "react";
import { Outlet } from "react-router-dom";
import { isProviderAuthenticated } from "@/lib/provider-auth";
import ProviderLogin from "./ProviderLogin";

export interface ProviderOutletContext {
  signOut: () => void;
}

const ProviderGate = () => {
  const [authenticated, setAuthenticated] = useState(isProviderAuthenticated());

  if (!authenticated) {
    return <ProviderLogin onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <Outlet
      context={{
        signOut: () => {
          setAuthenticated(false);
        },
      }}
    />
  );
};

export default ProviderGate;
