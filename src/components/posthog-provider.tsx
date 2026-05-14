"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init("phc_pQziHsPsi2CsPzbg9fjBwPyxTMrR2pLpvkaSjt4LfRco", {
      api_host: "https://eu.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
