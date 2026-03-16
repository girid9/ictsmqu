import { applyTheme, getStoredThemeId } from './lib/themes';

// Apply stored theme before render to prevent flash
applyTheme(getStoredThemeId());

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
