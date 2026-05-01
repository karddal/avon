"use client";

import * as React from "react";

export function useImpersonationPortalContainer() {
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalContainer(
      document.querySelector<HTMLElement>("[data-impersonation-content]"),
    );
  }, []);

  return portalContainer;
}
