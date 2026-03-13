import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initSqlite, executeQuery, importLrcat, getDb } from '../db/sqlite';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [cameraFilter, setCameraFilter] = useState('');
  const [lensFilter, setLensFilter] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    const start = async () => {
      try {
        await initSqlite();
        setIsInitialized(true);
      } catch (err) {
        setError(err.message);
      }
    };
    start();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const db = getDb();
      try {
        const hasTable = db.selectValue("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='Lightroom_raw'");
        if (hasTable) {
          const months = executeQuery(`
            SELECT DISTINCT strftime('%Y-%m', CaptureTime) as month 
            FROM Lightroom_raw 
            WHERE CaptureTime IS NOT NULL 
            ORDER BY month ASC
          `);
          setAvailableMonths(months.map(m => m.month));
        }
      } catch (e) {
        console.warn('Failed to fetch available months:', e);
      }
    }
  }, [isInitialized, isImporting]);

  const handleImport = async (file) => {
    setIsImporting(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = await importLrcat(buffer);
      setDateRange({ from: '', to: '' });
      return result;
    } catch (err) {
      setError(err.message || 'Import failed');
      return { success: false, error: err.message };
    } finally {
      setIsImporting(false);
    }
  };

  const getMetrics = useCallback((sql, params = [], useFilter = true) => {
    if (!isInitialized) return [];
    try {
      let finalSql = sql;
      if (useFilter && (dateRange.from || dateRange.to || cameraFilter || lensFilter)) {
        const filters = [];
        if (dateRange.from) filters.push(`CaptureTime >= '${dateRange.from}-01'`);
        if (dateRange.to) filters.push(`CaptureTime <= '${dateRange.to}-31'`);
        if (cameraFilter) filters.push(`Camera = '${cameraFilter.replace(/'/g, "''")}'`);
        
        let subquery = "SELECT * FROM Lightroom_raw";
        if (lensFilter) {
          // If we have a lens filter, we need to join with mappings to identify the group
          subquery = `
            SELECT lr.* FROM Lightroom_raw lr 
            LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName 
            WHERE COALESCE(lm.GroupName, lr.Lens) = '${lensFilter.replace(/'/g, "''")}'
          `;
        }

        const filterStr = filters.join(' AND ');
        if (filterStr) {
          if (lensFilter) {
            subquery = `SELECT * FROM (${subquery}) WHERE ${filterStr}`;
          } else {
            subquery = `SELECT * FROM Lightroom_raw WHERE ${filterStr}`;
          }
        }
        
        finalSql = sql.replace(/Lightroom_raw/g, `(${subquery})`);
      }
      return executeQuery(finalSql, params);
    } catch (err) {
      console.error('Query failed:', err);
      return [];
    }
  }, [isInitialized, dateRange, cameraFilter, lensFilter]);

  const hasData = useCallback(() => {
    if (!isInitialized) return false;
    const db = getDb();
    if (!db) return false;
    try {
      const hasTable = db.selectValue("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='Lightroom_raw'");
      if (!hasTable) return false;
      return db.selectValue("SELECT COUNT(*) FROM Lightroom_raw") > 0;
    } catch {
      return false;
    }
  }, [isInitialized]);

  const saveMappings = useCallback((mappings) => {
    if (!isInitialized) return;
    const db = getDb();
    try {
      db.transaction(() => {
        for (const { original, group } of mappings) {
          if (group && group.trim()) {
            db.exec({
              sql: "INSERT OR REPLACE INTO LensMappings (OriginalName, GroupName) VALUES (?, ?)",
              bind: [original, group]
            });
          } else {
            db.exec({
              sql: "DELETE FROM LensMappings WHERE OriginalName = ?",
              bind: [original]
            });
          }
        }
      });

      const lookup = {};
      const allMappings = getMetrics("SELECT OriginalName, GroupName FROM LensMappings", [], false);
      allMappings.forEach(m => lookup[m.OriginalName] = m.GroupName);
      localStorage.setItem('lr_lens_mappings', JSON.stringify(lookup));

      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    }
  }, [isInitialized, getMetrics]);

  const value = {
    isInitialized,
    isImporting,
    error,
    handleImport,
    getMetrics,
    hasData,
    saveMappings,
    dateRange,
    setDateRange,
    cameraFilter,
    setCameraFilter,
    lensFilter,
    setLensFilter,
    availableMonths
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
