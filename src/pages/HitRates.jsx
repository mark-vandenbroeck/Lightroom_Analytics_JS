import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Bar } from 'react-chartjs-2';
import { HIT_RATE_BY_FOCAL_QUERY } from '../db/queries';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const HitRates = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData } = useDatabase();

  const focalHitData = useMemo(() => hasData() ? getMetrics(HIT_RATE_BY_FOCAL_QUERY) : [], [hasData, getMetrics]);

  if (!hasData()) return <div className="glass p-12 text-center text-slate-400">Please import data first.</div>;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold title-gradient">{t('hit_title')}</h2>
        <p className="text-slate-400">{t('hit_desc')}</p>
      </header>

      <div className="glass p-8">
        <h3 className="text-lg font-semibold mb-6">{t('hit_focal')}</h3>
        <div className="h-[400px]">
          <Bar 
            data={{
              labels: focalHitData.map(d => `${d.label}mm`),
              datasets: [
                {
                  label: t('lensprof_hitrate') + ' (%)',
                  data: focalHitData.map(d => Math.round((d.pick_count / d.total_photos) * 100)),
                  backgroundColor: 'rgba(16, 185, 129, 0.5)',
                  borderColor: '#10b981',
                  borderWidth: 1,
                  type: 'line',
                  yAxisID: 'y1',
                },
                {
                  label: t('dash_metric_total'),
                  data: focalHitData.map(d => d.total_photos),
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: 4,
                  yAxisID: 'y',
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { type: 'linear', position: 'left', grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: { type: 'linear', position: 'right', min: 0, max: 100, grid: { display: false } },
                x: { grid: { display: false } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HitRates;
