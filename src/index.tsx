import { render } from 'solid-js/web';
import { MetaProvider } from '@solidjs/meta';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App';
import './index.css';

inject();
injectSpeedInsights();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(
  () => (
    <MetaProvider>
      <App />
    </MetaProvider>
  ),
  root
);
