
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get saved theme to avoid flash of wrong theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.classList.add(savedTheme);

createRoot(document.getElementById("root")!).render(<App />);
