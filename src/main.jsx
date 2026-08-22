import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import "./styles/index.css";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import {
  reportUnhandledError,
  reportUnhandledRejection,
} from "./utils/monitoring.js";

window.addEventListener("error", (event) => {
  reportUnhandledError(event);
});

window.addEventListener("unhandledrejection", (event) => {
  reportUnhandledRejection(event);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
