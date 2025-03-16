import { createRoot } from 'react-dom/client';

// Import Three.js dependencies
import './lib/three-imports';

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
