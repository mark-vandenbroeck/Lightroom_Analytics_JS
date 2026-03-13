import React, { useRef, useMemo } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { Upload, Database, AlertCircle, Loader2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const Dashboard = () => {
  const { t } = useTranslation();
  const { handleImport, isImporting, error, hasData, getMetrics } = useDatabase();
  const fileInputRef = useRef(null);

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImport(file);
    }
  };

  const monthlyData = useMemo(() => {
    if (!hasData()) return [];
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

  if (!hasData()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4 max-w-xl">
          <h2 className="text-5xl font-bold title-gradient">{t('dash_welcome')}</h2>
          <p className="text-slate-400 text-lg">{t('dash_intro')}</p>
        </div>
        
        <label className="group relative cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-12 py-8 glass leading-none flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Upload className="text-blue-400" size={32} />
            </div>
            <span className="text-xl font-semibold">{t('dash_import_btn')}</span>
            <input 
              type="file" 
              accept=".lrcat" 
              onChange={onFileChange} 
              className="hidden" 
              disabled={isImporting}
            />
          </div>
        </label>

        {isImporting && (
          <div className="flex items-center gap-3 text-blue-400 animate-pulse">
            <Loader2 className="animate-spin" size={20} />
            <span>{t('dash_import_loading')}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-3 text-red-400 max-w-md">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold title-gradient">{t('nav_dashboard')}</h2>
          <p className="text-slate-400">{t('dash_summary')}</p>
        </div>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <Upload size={18} />
          {t('dash_update')}
          <input type="file" accept=".lrcat" onChange={onFileChange} className="hidden" disabled={isImporting} />
        </label>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('dash_metric_total'), value: monthlyData.reduce((a, b) => a + b.total_photos, 0), color: 'blue' },
          { label: t('dash_metric_picks'), value: monthlyData.reduce((a, b) => a + (b.pick_count || 0), 0), color: 'purple' },
          { label: t('dash_metric_months'), value: monthlyData.length, color: 'blue' },
          { label: t('dash_metric_avg'), value: monthlyData.length ? Math.round(monthlyData.reduce((a, b) => a + b.total_photos, 0) / monthlyData.length) : 0, color: 'purple' }
        ].map((m, i) => (
          <div key={i} className="glass p-6 group hover:border-blue-500/50 transition-all">
            <p className="text-sm font-medium text-slate-400 mb-1">{m.label}</p>
            <p className={`text-3xl font-bold text-${m.color}-400`}>{m.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="glass p-8">
        <h3 className="text-xl font-semibold mb-8">{t('dash_activity')}</h3>
        <div className="h-[400px]">
          <Bar 
            data={{
              labels: monthlyData.map(d => d.month),
              datasets: [
                {
                  label: t('label_photos'),
                  data: monthlyData.map(d => d.total_photos),
                  backgroundColor: 'rgba(59, 130, 246, 0.4)',
                  borderColor: '#3b82f6',
                  borderWidth: 1,
                  borderRadius: 4,
                  yAxisID: 'y',
                },
                {
                  label: t('label_picks'),
                  data: monthlyData.map(d => d.pick_count),
                  backgroundColor: 'rgba(168, 85, 247, 0.4)',
                  borderColor: '#a855f7',
                  borderWidth: 1,
                  borderRadius: 4,
                  yAxisID: 'y',
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
                x: { grid: { display: false }, ticks: { color: '#64748b' } },
                y: { 
                  grid: { color: 'rgba(255,255,255,0.05)' },
                  ticks: { color: '#64748b' }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
