import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Scatter } from 'react-chartjs-2';
import { CORRELATION_QUERY } from '../db/queries';
import { formatShutterSpeed, formatAperture } from '../utils/exif';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const Correlations = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData } = useDatabase();

  const scatterData = useMemo(() => hasData() ? getMetrics(CORRELATION_QUERY) : [], [hasData, getMetrics]);

  const aperShutterData = {
    datasets: [{
      label: t('scatter_aperture_shutter'),
      data: scatterData.map(d => ({ x: d.Aperture, y: d.shutter_sec })),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    }]
  };

  const shutterIsoData = {
    datasets: [{
      label: t('scatter_iso_shutter'),
      data: scatterData.map(d => ({ x: d.shutter_sec, y: d.ISO })),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
    }]
  };

  const aperIsoData = {
    datasets: [{
      label: t('scatter_aperture_iso'),
      data: scatterData.map(d => ({ x: d.Aperture, y: d.ISO })),
      backgroundColor: 'rgba(236, 72, 153, 0.5)',
    }]
  };

  if (!hasData()) return <div className="glass p-12 text-center text-slate-400">Please import data first.</div>;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold title-gradient">{t('scatter_title')}</h2>
        <p className="text-slate-400">{t('scatter_desc')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass p-8">
          <h3 className="text-lg font-semibold mb-6">{t('scatter_aperture_shutter')}</h3>
          <div className="h-[350px]">
            <Scatter 
              data={aperShutterData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `${formatAperture(context.raw.x)}, ${formatShutterSpeed(context.raw.y)}`
                    }
                  }
                },
                scales: {
                  x: { 
                    title: { display: true, text: t('axis_aperture'), color: '#94a3b8' }, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                      callback: (value) => formatAperture(value)
                    }
                  },
                  y: { 
                    title: { display: true, text: t('axis_shutter'), color: '#94a3b8' }, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                      callback: (value) => formatShutterSpeed(value)
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass p-8">
          <h3 className="text-lg font-semibold mb-6">{t('scatter_iso_shutter')}</h3>
          <div className="h-[350px]">
            <Scatter 
              data={shutterIsoData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `${formatShutterSpeed(context.raw.x)}, ISO ${context.raw.y}`
                    }
                  }
                },
                scales: {
                  x: { 
                    title: { display: true, text: t('axis_shutter'), color: '#94a3b8' }, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                      callback: (value) => formatShutterSpeed(value)
                    }
                  },
                  y: { title: { display: true, text: t('axis_iso'), color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass p-8">
          <h3 className="text-lg font-semibold mb-6">{t('scatter_aperture_iso')}</h3>
          <div className="h-[350px]">
            <Scatter 
              data={aperIsoData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `${formatAperture(context.raw.x)}, ISO ${context.raw.y}`
                    }
                  }
                },
                scales: {
                  x: { 
                    title: { display: true, text: t('axis_aperture'), color: '#94a3b8' }, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                      callback: (value) => formatAperture(value)
                    }
                  },
                  y: { title: { display: true, text: t('axis_iso'), color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Correlations;
