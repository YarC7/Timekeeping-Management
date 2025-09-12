import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

// Create the root once and render the app
const root = createRoot(container);
root.render(<App />);
