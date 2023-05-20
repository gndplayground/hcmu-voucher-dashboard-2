import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";

import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container as any);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
