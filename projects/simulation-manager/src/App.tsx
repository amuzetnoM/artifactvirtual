import React from 'react';
import { Simulation } from './components/Simulation';
import { SimulationProvider } from './context/SimulationContext';
import { Header } from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <SimulationProvider>
        <Header />
        <Simulation />
      </SimulationProvider>
    </div>
  );
}

export default App;