import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Bar, Doughnut } from 'react-chartjs-2';
import { RATINGS_QUERY, AVG_EDITS_LENS_QUERY, AVG_EDITS_CAMERA_QUERY } from '../db/queries';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const QualityEdits = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData } = useDatabase();

  const ratingsData = useMemo(() => hasData() ? getMetrics(RATINGS_QUERY) : [], [hasData, getMetrics]);
  const editsLensData = useMemo(() => hasData() ? getMetrics(AVG_EDITS_LENS_QUERY) : [], [hasData, getMetrics]);
  const editsCameraData = useMemo(() => hasData() ? getMetrics(AVG_EDITS_CAMERA_QUERY) : [], [hasData, getMetrics]);

  if (!hasData()) return <div className="glass p-12 text-center text-slate-400">Please import data first.</div>;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold title-gradient">{t('edits_title')}</h2>
        <p className="text-slate-400">{t('edits_desc')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 col-span-1">
          <h3 className="text-lg font-semibold mb-6">{t('edits_stars')}</h3>
          <div className="h-[300px]">
            <Bar 
              data={{
                labels: ratingsData.map(d => `${d.label} ★`),
                datasets: [{
                  label: 'Photos',
                  data: ratingsData.map(d => d.count),
                  backgroundColor: 'rgba(245, 158, 11, 0.5)',
                  borderRadius: 4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        <div className="glass p-8 col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-6">{t('edits_lens')}</h3>
          <div className="h-[300px]">
            <Bar 
              data={{
                labels: editsLensData.map(d => d.label),
                datasets: [{
                  label: 'Avg. Edits',
                  data: editsLensData.map(d => d.avg_edits),
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                  borderRadius: 4
                }]
              }}
              options={{ 
                indexAxis: 'y', 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } } 
              }}
            />
          </div>
        </div>
      </div>

      <div className="glass p-8">
        <h3 className="text-lg font-semibold mb-6">{t('edits_camera')}</h3>
        <div className="h-[300px]">
          <Bar 
            data={{
              labels: editsCameraData.map(d => d.label),
              datasets: [{
                label: 'Avg. Edits',
                data: editsCameraData.map(d => d.avg_edits),
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderRadius: 4
              }]
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
        </div>
      </div>
    </div>
  );
};

export default QualityEdits;
