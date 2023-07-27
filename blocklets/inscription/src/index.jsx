import { createRoot } from 'react-dom/client';
// eslint-disable-next-line import/no-unresolved
import 'virtual:windi.css';
import App from './app';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
