import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeStorage } from "./lib/storage";

// Initialize storage with mock data if empty
initializeStorage();

createRoot(document.getElementById("root")!).render(<App />);
