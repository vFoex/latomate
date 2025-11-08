import { createRoot } from 'react-dom/client';
import StatsPage from './StatsPage';
import './stats.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<StatsPage />);
}
