import React from "react";
import App from "./App";
import { VisionUIControllerProvider } from "./context";

export default function DashboardApp() {
  return (
    <VisionUIControllerProvider>
      <App />
    </VisionUIControllerProvider>
  );
}