import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'

import App from './App.tsx'
import EnergyManagementSuite from './EnergyManagementSuite.tsx';
import PlanCreator from './PlanCreator.tsx';
import SavingsCalculator from './SavingsCalculator.tsx';
import MultiJobCalculator from './MultiJobCalculator.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/energy" element={<EnergyManagementSuite />} />
        <Route path="/plan" element={<PlanCreator />} />
        <Route path="/savings" element={<SavingsCalculator />} />
        <Route path="/multijob-savings" element={<MultiJobCalculator />} />
      </Routes>
    </Router>
  </StrictMode>,
)
