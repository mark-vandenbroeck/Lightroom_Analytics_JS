import React, { useMemo, useState } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import { CAMERA_DISTRIBUTION_QUERY, LENS_DISTRIBUTION_QUERY, EXPLORE_METRICS_QUERY } from '../db/queries';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const Explore = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData, dateRange, cameraFilter, lensFilter } = useDatabase();

  const monthlyData = useMemo(() => {
    if (!hasData()) return [];
    
    // Use the existing EXPLORE_METRICS_QUERY or just getMetrics with useFilter=true
    // Since getMetrics now handles camera and lens filters globally, we can just use the monthly activity query directly
    return getMetrics(`
      SELECT 
        strftime('%Y-%m', CaptureTime) as month,
        COUNT(*) as total_photos,
        SUM(CASE WHEN pick = 1 THEN 1 ELSE 0 END) as pick_count
      FROM Lightroom_raw
      WHERE CaptureTime IS NOT NULL
      GROUP BY month
      ORDER BY month ASC
    `);
  }, [hasData, getMetrics]);

  const cameraData = useMemo(() => hasData() ? getMetrics(CAMERA_DISTRIBUTION_QUERY) : [], [hasData, getMetrics]);
  const lensData = useMemo(() => hasData() ? getMetrics(LENS_DISTRIBUTION_QUERY) : [], [hasData, getMetrics]);

  const COLORS = [
    'rgba(59, 130, 246, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)',
    'rgba(245, 158, 11, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(107, 114, 128, 0.7)'
  ];

  const cameraChart = {
    labels: cameraData.map(d => d.Camera),
    datasets: [{
      data: cameraData.map(d => d.count),
      backgroundColor: COLORS,
      borderWidth: 0,
    }]
  };

  const lensChart = {
    labels: lensData.map(d => d.Lens),
    datasets: [{
      data: lensData.map(d => d.count),
      backgroundColor: COLORS,
      borderWidth: 0,
    }]
  };

  if (!hasData()) {
    return (
      <div className="glass p-12 text-center">
        <h3 className="text-xl font-bold mb-2">{t('explore_empty')}</h3>
        <p className="text-slate-400">{t('explore_empty_desc')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold title-gradient">{t('explore_title')}</h2>
        <p className="text-slate-400">{t('explore_desc')}</p>
      </header>

      {/* Monthly Activity Line Chart */}
      <div className="glass p-8">
        <h3 className="text-lg font-semibold mb-8">{t('dash_activity')}</h3>
        
        <div className="h-[350px]">
          <Line 
            data={{
              labels: monthlyData.map(d => d.month),
              datasets: [
                {
                  label: t('label_photos'),
                  data: monthlyData.map(d => d.total_photos),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                },
                {
                  label: t('label_picks'),
                  data: monthlyData.map(d => d.pick_count),
                  borderColor: '#a855f7',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', align: 'end', labels: { color: '#94a3b8', boxWidth: 12, usePointStyle: true } }
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-6 self-start">{t('explore_camera_share')}</h3>
          <div className="w-full max-w-[500px]">
            <Pie data={cameraChart} options={{ 
              plugins: { 
                legend: { 
                  position: 'right', 
                  labels: { color: '#94a3b8', boxWidth: 12, padding: 20 } 
                } 
              } 
            }} />
          </div>
        </div>

        <div className="glass p-8 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-6 self-start">{t('explore_lens_share')}</h3>
          <div className="w-full max-w-[500px]">
            <Doughnut data={lensChart} options={{ 
              plugins: { 
                legend: { 
                  position: 'right', 
                  labels: { color: '#94a3b8', boxWidth: 12, padding: 20 } 
                } 
              } 
            }} />
          </div>
        </div>
      </div>
      
      <div className="glass p-8">
        <h3 className="text-lg font-semibold mb-6">{t('explore_top_lenses')}</h3>
        <div className="h-[300px]">
          <Bar 
            data={{
              labels: lensData.slice(0, 10).map(d => d.Lens),
              datasets: [{
                label: t('label_photos'),
                data: lensData.slice(0, 10).map(d => d.count),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderRadius: 4
              }]
            }}
            options={{ 
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { 
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { display: false } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Explore;
