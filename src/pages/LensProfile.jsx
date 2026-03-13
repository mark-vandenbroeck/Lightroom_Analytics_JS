import React, { useMemo, useState } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const LensProfile = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData } = useDatabase();
  const [selectedLens, setSelectedLens] = useState('');

  const lenses = useMemo(() => {
    if (!hasData()) return [];
    return getMetrics(`SELECT DISTINCT COALESCE(lm.GroupName, lr.Lens) as LensName FROM Lightroom_raw lr LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName ORDER BY LensName`, [], false);
  }, [hasData, getMetrics]);

  const profileData = useMemo(() => {
    if (!selectedLens) return null;
    return getMetrics(`
      SELECT 
        CAST(ROUND(FocalLength) AS INTEGER) as focal,
        COUNT(*) as count
      FROM Lightroom_raw lr
      LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName
      WHERE COALESCE(lm.GroupName, lr.Lens) = ?
      GROUP BY focal
      ORDER BY focal ASC
    `, [selectedLens]);
  }, [selectedLens, getMetrics]);

  if (!hasData()) return <div className="glass p-12 text-center text-slate-400">Please import data first.</div>;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold title-gradient">{t('lens_title')}</h2>
        <p className="text-slate-400">{t('lens_desc')}</p>
      </header>

      <div className="glass p-6 flex flex-col gap-4">
        <label className="text-sm font-medium text-slate-400">{t('lens_select_label')}</label>
        <select 
          value={selectedLens} 
          onChange={(e) => setSelectedLens(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded px-4 py-2 focus:border-blue-500 focus:outline-none text-white"
        >
          <option value="" className="bg-slate-900">{t('lensprof_select')}...</option>
          {lenses.map(l => <option key={l.LensName} value={l.LensName} className="bg-slate-900">{l.LensName}</option>)}
        </select>
      </div>

      {profileData && (
        <div className="glass p-8">
          <h3 className="text-lg font-semibold mb-6 text-white">{selectedLens} - {t('lens_focal')}</h3>
          <div className="h-[400px]">
            <Bar 
              data={{
                labels: profileData.map(d => `${d.focal}mm`),
                datasets: [{
                  label: t('label_photos'),
                  data: profileData.map(d => d.count),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderRadius: 4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LensProfile;
