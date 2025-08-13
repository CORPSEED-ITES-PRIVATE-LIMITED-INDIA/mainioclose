import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@heroui/react";
import { Provider } from "react-redux";
import "./styles/globals.css";
import App from "./App.jsx";
import { UiProvider } from "./uiprovider.jsx";
import { store } from "./toolkit/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <ToastProvider placement="top-right" toastOffset={60} />
    <Provider store={store}>
      <BrowserRouter>
        <UiProvider>
          <App />
        </UiProvider>
      </BrowserRouter>
    </Provider>
  </>
);
