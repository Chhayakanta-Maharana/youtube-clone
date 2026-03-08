import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ThemeProvider } from "./context/ThemeContext";



import { AuthProvider } from "./context/AuthContext";
import { AppDataProvider } from "./context/AppDataContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

console.log("main.jsx: starting render");

import ErrorBoundary from "./components/ErrorBoundary";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "704085642926-dudpnoifi3m8t3a2vp3k58rkgl36mntj.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ErrorBoundary>
      <AuthProvider>
        <AppDataProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AppDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  </GoogleOAuthProvider>
);
