import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { lazy, Suspense, ErrorBoundary } from 'solid-js';
import { MetaProvider } from '@solidjs/meta';
import App from './App';
import './index.css';

const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(
  () => (
    <MetaProvider>
      <ErrorBoundary fallback={(err) => (
        <div class="min-h-screen bg-[#f0ede8] flex items-center justify-center px-6">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] opacity-30 mb-4 font-mono">Error</p>
            <p class="text-lg font-light opacity-60">{err.message ?? 'Something went wrong.'}</p>
            <a href="/" class="text-sm opacity-40 hover:opacity-100 transition-opacity mt-6 block">← Back to Bureau</a>
          </div>
        </div>
      )}>
        <Suspense>
          <Router>
            <Route path="/" component={App} />
            <Route path="/project/:slug" component={ProjectPage} />
            <Route path="*" component={NotFound} />
          </Router>
        </Suspense>
      </ErrorBoundary>
    </MetaProvider>
  ),
  root
);
