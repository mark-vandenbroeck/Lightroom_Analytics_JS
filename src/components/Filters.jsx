import React from 'react';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { useTranslation } from '../i18n/translations';
import { Calendar } from 'lucide-react';

const Filters = () => {
  const { 
    availableMonths, dateRange, setDateRange, 
    cameraFilter, setCameraFilter,
    lensFilter, setLensFilter,
    hasData, getMetrics 
  } = useDatabase();
  const { t } = useTranslation();

  const cameras = React.useMemo(() => {
    if (!hasData()) return [];
    return getMetrics("SELECT DISTINCT Camera FROM Lightroom_raw WHERE Camera IS NOT NULL ORDER BY Camera", [], false);
  }, [hasData, getMetrics]);

  const mappedLenses = React.useMemo(() => {
    if (!hasData()) return [];
    return getMetrics("SELECT DISTINCT COALESCE(lm.GroupName, lr.Lens) as LensName FROM Lightroom_raw lr LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName ORDER BY LensName", [], false);
  }, [hasData, getMetrics]);

  if (!hasData()) return null;

  const handleReset = () => {
    setDateRange({ from: '', to: '' });
    setCameraFilter('');
    setLensFilter('');
  };

  return (
    <div className="glass p-4 mb-8 flex flex-wrap items-center gap-6 animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-2 text-blue-400 min-w-[120px]">
        <Calendar size={18} />
        <span className="font-semibold text-sm uppercase tracking-wider">{t('filters_title')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 flex-1">
        {/* Date Filters */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">{t('filters_from')}</label>
            <select 
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-all text-white"
            >
              <option value="" className="bg-slate-900">Start...</option>
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-slate-900">{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">{t('filters_to')}</label>
            <select 
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-all text-white"
            >
              <option value="" className="bg-slate-900">End...</option>
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-slate-900">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gear Filters */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">{t('filter_camera')}</label>
            <select 
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-all text-white min-w-[150px]"
            >
              <option value="" className="bg-slate-900">{t('filter_all_cameras')}</option>
              {cameras.map(c => <option key={c.Camera} value={c.Camera} className="bg-slate-900">{c.Camera}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">{t('filter_lens')}</label>
            <select 
              value={lensFilter}
              onChange={(e) => setLensFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-all text-white min-w-[180px]"
            >
              <option value="" className="bg-slate-900">{t('filter_all_lenses')}</option>
              {mappedLenses.map(l => <option key={l.LensName} value={l.LensName} className="bg-slate-900">{l.LensName}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="mt-5 text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Filters;
