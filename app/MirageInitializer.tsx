"use client";

import { useEffect } from "react";
import { makeServer } from "../mirage/server";

export function MirageInitializer() {
  useEffect(() => {
    // Only run Mirage in the browser and preferably in development mode.
    // If you want it available in production (e.g. Vercel deployment for the assignment format),
    // you can remove the process.env.NODE_ENV check.
    if (typeof window !== "undefined") {
      makeServer({ environment: "development" });
    }
  }, []);

  return null;
}
