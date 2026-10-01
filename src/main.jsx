import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import PwaBanner from "./components/PwaBanner.jsx";
import { registerSW } from "./pwa.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
            <PwaBanner />
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Splash ekranni yashirish: birinchi ochilishda kamida 2.4 s ko'rsatamiz, keyin silliq yo'qotamiz
const splash = document.getElementById("splash");
if (splash) {
  const MIN_MS = document.documentElement.classList.contains("no-splash") ? 0 : 2400;
  const hide = () => {
    splash.classList.add("hide");
    try { sessionStorage.setItem("splash-seen", "1"); } catch { /* ignore */ }
    // Status bar rangini ilova foniga moslaymiz
    const dark = document.documentElement.classList.contains("dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0C101E" : "#F0F3FB");
    setTimeout(() => splash.remove(), 700);
  };
  const wait = Math.max(0, MIN_MS - performance.now());
  setTimeout(hide, wait);
}

registerSW();
