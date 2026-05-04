import { render } from 'solid-js/web';
import { MetaProvider } from '@solidjs/meta';
import App from './App';
import './index.css';

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
