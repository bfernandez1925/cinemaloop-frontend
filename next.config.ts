import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático: se despliega en Firebase Hosting (ADR-0007), sin
  // servidor Next.js — toda la lógica dinámica pasa por Cloud Functions
  // callable (ADR-0001), así que no hace falta SSR.
  output: "export",
};

export default nextConfig;
