import { lazy } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import { RootLayout } from './components/Layout';

const Overview = lazy(() => import('./routes/Overview'));
const Feed = lazy(() => import('./routes/Feed'));
const Sources = lazy(() => import('./routes/Sources'));
const SourceDetail = lazy(() => import('./routes/SourceDetail'));
const Intelligence = lazy(() => import('./routes/Intelligence'));
const NotFound = lazy(() => import('./routes/NotFound'));

export default function App() {
  return (
    <Router root={RootLayout}>
      <Route path="/" component={Overview} />
      <Route path="/feed" component={Feed} />
      <Route path="/sources" component={Sources} />
      <Route path="/sources/:source" component={SourceDetail} />
      <Route path="/intelligence" component={Intelligence} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
