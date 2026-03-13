import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Bar } from 'react-chartjs-2';
import { FOCAL_HISTOGRAM_QUERY, APERTURE_DISTRIBUTION_QUERY, ISO_DISTRIBUTION_QUERY, SHUTTER_SPEED_DISTRIBUTION_QUERY } from '../db/queries';
import { categorizeAperture, formatShutterSpeed, formatAperture } from '../utils/exif';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const EXIFAnalytics = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData } = useDatabase();

  const focalData = useMemo(() => hasData() ? getMetrics(FOCAL_HISTOGRAM_QUERY) : [], [hasData, getMetrics]);
  const apertureData = useMemo(() => hasData() ? getMetrics(APERTURE_DISTRIBUTION_QUERY) : [], [hasData, getMetrics]);
  const isoData = useMemo(() => hasData() ? getMetrics(ISO_DISTRIBUTION_QUERY) : [], [hasData, getMetrics]);
  const shutterData = useMemo(() => hasData() ? getMetrics(SHUTTER_SPEED_DISTRIBUTION_QUERY) : [], [hasData, getMetrics]);

  // Bucketed Aperture
  const bucketedAperture = useMemo(() => {
    const buckets = {};
    apertureData.forEach(d => {
      const bucket = categorizeAperture(parseFloat(d.label));
      buckets[bucket] = (buckets[bucket] || 0) + d.count;
    });
    return Object.entries(buckets).map(([label, count]) => ({ label, count }));
  }, [apertureData]);

  if (!hasData()) {
    return <div className="glass p-12 text-center text-slate-400">Please import data first.</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold title-gradient">{t('nav_exif')}</h2>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass p-8">
          <h3 className="text-lg font-semibold mb-6">{t('exif_focal')}</h3>
          <div className="h-[300px]">
            <Bar 
              data={{
                labels: focalData.map(d => `${d.label}mm`),
                datasets: [{
                  label: t('label_photos'),
                  data: focalData.map(d => d.count),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderRadius: 2
                }]
              }}
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                  x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 20 } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }}
            />
          </div>
        </div>

        <div className="glass p-8">
          <h3 className="text-lg font-semibold mb-6">{t('exif_shutter')}</h3>
          <div className="h-[300px]">
            <Bar 
              data={{
                labels: shutterData.map(d => formatShutterSpeed(parseFloat(d.label))),
                datasets: [{
                  label: t('label_photos'),
                  data: shutterData.map(d => d.count),
                  backgroundColor: 'rgba(34, 197, 94, 0.5)',
                  borderRadius: 2
                }]
              }}
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                  x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 15 } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8">
            <h3 className="text-lg font-semibold mb-6">{t('exif_aperture')}</h3>
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: apertureData.map(d => formatAperture(d.label)),
                  datasets: [{
                    label: t('label_photos'),
                    data: apertureData.map(d => d.count),
                    backgroundColor: 'rgba(139, 92, 246, 0.5)',
                    borderRadius: 4
                  }]
                }}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { 
                    x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 15 } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                  }
                }}
              />
            </div>
          </div>

          <div className="glass p-8">
            <h3 className="text-lg font-semibold mb-6">{t('exif_iso')}</h3>
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: isoData.map(d => d.label),
                  datasets: [{
                    label: t('label_photos'),
                    data: isoData.map(d => d.count),
                    backgroundColor: 'rgba(236, 72, 153, 0.5)',
                    borderRadius: 4
                  }]
                }}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { 
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EXIFAnalytics;
