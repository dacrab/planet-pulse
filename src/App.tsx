import { Component } from 'solid-js';
import { StoreProvider } from './stores/context';
import { Dashboard } from './components/Dashboard';

const App: Component = () => {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
};

export default App;
