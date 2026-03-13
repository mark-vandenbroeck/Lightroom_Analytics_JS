import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import EXIFAnalytics from './pages/EXIFAnalytics';
import HitRates from './pages/HitRates';
import Correlations from './pages/Correlations';
import QualityEdits from './pages/QualityEdits';
import LensConfig from './pages/LensConfig';
import LensProfile from './pages/LensProfile';
import { LanguageProvider } from './i18n/translations.jsx';
import { DatabaseProvider } from './hooks/useDatabase.jsx';

const App = () => {
  return (
    <LanguageProvider>
      <DatabaseProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="explore" element={<Explore />} />
            <Route path="exif" element={<EXIFAnalytics />} />
            <Route path="correlations" element={<Correlations />} />
            <Route path="hitrates" element={<HitRates />} />
            <Route path="quality" element={<QualityEdits />} />
            <Route path="lensprofile" element={<LensProfile />} />
            <Route path="lensconfig" element={<LensConfig />} />
          </Route>
        </Routes>
      </Router>
      </DatabaseProvider>
    </LanguageProvider>
  );
};

export default App;
