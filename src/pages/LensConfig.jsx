import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n/translations.jsx';
import { useDatabase } from '../hooks/useDatabase.jsx';
import { GET_MAPPINGS_QUERY } from '../db/queries';
import { Save, CheckCircle } from 'lucide-react';

const LensConfig = () => {
  const { t } = useTranslation();
  const { getMetrics, hasData, saveMappings } = useDatabase();
  const [mappings, setMappings] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const initialData = useMemo(() => hasData() ? getMetrics(GET_MAPPINGS_QUERY, [], false) : [], [hasData, getMetrics]);

  useEffect(() => {
    if (initialData.length > 0) {
      setMappings(initialData.map(d => ({ original: d.OriginalName, group: d.GroupName || '', count: d.count })));
    }
  }, [initialData]);

  const handleChange = (original, value) => {
    setMappings(prev => prev.map(m => m.original === original ? { ...m, group: value } : m));
  };

  const handleSave = () => {
    const success = saveMappings(mappings);
    if (success) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }
  };

  if (!hasData()) return <div className="glass p-12 text-center text-slate-400">Please import data first.</div>;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold title-gradient">{t('config_title')}</h2>
          <p className="text-slate-400 max-w-2xl">{t('config_desc')}</p>
        </div>
        <button 
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          {showSaved ? <CheckCircle size={20} /> : <Save size={20} />}
          {showSaved ? t('config_success') : t('config_save')}
        </button>
      </header>

      <div className="glass overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 font-semibold text-slate-300 w-1/2">{t('config_col_original')}</th>
              <th className="p-4 font-semibold text-slate-300 w-16 text-center">{t('config_col_photos')}</th>
              <th className="p-4 font-semibold text-slate-300 w-1/2">{t('config_col_group')}</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.original} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-sm font-mono text-slate-400">{m.original}</td>
                <td className="p-4 text-center text-sm font-medium">{m.count}</td>
                <td className="p-4">
                  <input 
                    type="text" 
                    value={m.group}
                    onChange={(e) => handleChange(m.original, e.target.value)}
                    placeholder={t('config_col_group') + '...'}
                    className="w-full bg-slate-800/50 border border-white/10 rounded px-3 py-1.5 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LensConfig;
