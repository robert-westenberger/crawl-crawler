import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Missing #root");
}

createRoot(rootElement).render(<Popup />);
