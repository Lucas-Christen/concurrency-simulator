import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrafficLightsPage from './pages/TrafficLightsPage';
import LibraryPage from './pages/LibraryPage';
import ProducerConsumerPage from './pages/ProducerConsumerPage';
import PhilosophersPage from './pages/PhilosophersPage';
import ConcurrencyVsParallelismPage from './pages/ConcurrencyVsParallelismPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/semaforos" element={<TrafficLightsPage />} />
        <Route path="/biblioteca" element={<LibraryPage />} />
        <Route path="/produtor-consumidor" element={<ProducerConsumerPage />} />
        <Route path="/filosofos" element={<PhilosophersPage />} />
        <Route path="/concorrencia-paralelismo" element={<ConcurrencyVsParallelismPage />} />
      </Routes>
    </Router>
  );
}

export default App;
