import { StoreProvider } from './stores/context';
import { Dashboard } from './components/Dashboard';

export default () => (
  <StoreProvider>
    <Dashboard />
  </StoreProvider>
);
