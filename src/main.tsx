import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeStorage } from "./lib/storage";

// Error handler for initialization errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Log to console for debugging
  if (event.error) {
    console.error('Error stack:', event.error.stack);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize storage with mock data if empty
try {
  initializeStorage();
} catch (error) {
  console.error('Storage initialization error:', error);
}

// Check if root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found! Check if index.html has <div id='root'></div>");
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found. Check console for details.</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: monospace;">
        <h1 style="color: red;">Application Error</h1>
        <p>Failed to initialize the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; overflow: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px;">Reload Page</button>
      </div>
    `;
  }
}
