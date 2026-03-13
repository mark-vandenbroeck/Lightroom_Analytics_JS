import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db = null;
let sqlite3 = null;

export const initSqlite = async () => {
  if (db) return { db, sqlite3 };

  console.log('--- INITIALIZING SQLITE (PURE MEMORY) ---');
  try {
    sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });

    console.log('SQLite Module Loaded');
    
    // Create primary DB explicitly in memory
    db = new sqlite3.oo1.DB(':memory:');
    console.log('Primary Memory DB Created');

    // Force all temp files into memory
    db.exec([
      "PRAGMA temp_store = 2;",       // 2 = MEMORY
      "PRAGMA journal_mode = MEMORY;",
      "PRAGMA cache_size = -64000;"   // 64MB cache
    ].join(' '));
    console.log('Memory pragmas applied to primary DB');

    // Initialize mappings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS LensMappings (
        OriginalName TEXT PRIMARY KEY,
        GroupName TEXT,
        Updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Load mappings
    const saved = localStorage.getItem('lr_lens_mappings');
    if (saved) {
      try {
        const mappings = JSON.parse(saved);
        db.transaction(() => {
          const stmt = db.prepare("INSERT INTO LensMappings (OriginalName, GroupName) VALUES (?, ?)");
          for (const [original, group] of Object.entries(mappings)) {
            stmt.bind([original, group]).stepReset();
          }
          stmt.finalize();
        });
        console.log('Mappings loaded from localStorage');
      } catch (e) {
        console.warn('LocalStorage mappings parse error:', e);
      }
    }

    return { db, sqlite3 };
  } catch (err) {
    console.error('SQLITE INIT ERROR:', err);
    throw err;
  }
};

export const getDb = () => db;

export const executeQuery = (sql, params = []) => {
  if (!db) throw new Error('Database not initialized');
  const result = [];
  db.exec({
    sql,
    bind: params,
    rowMode: 'object',
    callback: (row) => result.push(row),
  });
  return result;
};

export const importLrcat = async (arrayBuffer) => {
  const { sqlite3, db: destDb } = await initSqlite();
  
  console.log('--- IMPORT STARTED ---');
  console.log('File size:', (arrayBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');

  let sourceDb = null;
  try {
    // Stage 1: Header Patching
    // Offset 18 and 19 of the SQLite header indicate the file format version.
    // 1 = Rollback journal, 2 = WAL (Write-Ahead Log).
    // In WAL mode, SQLite requires companion files (-wal, -shm) which don't exist in our memory VFS.
    // We patch the header to "1" to force standard access.
    console.log('Step 1: Patching database header (bypassing WAL requirement)...');
    const view = new Uint8Array(arrayBuffer);
    if (view[18] === 2 || view[19] === 2) {
      console.log('Detected WAL mode. Resetting header version bytes to 1...');
      view[18] = 1;
      view[19] = 1;
    } else {
      console.log('Database is already in standard rollback mode.');
    }

    // Stage 2: Load into Memory
    console.log('Step 2: Creating source memory DB instance...');
    sourceDb = new sqlite3.oo1.DB(':memory:');
    
    console.log('Step 3: Allocating WASM memory and deserializing data...');
    const pBuf = sqlite3.wasm.allocFromTypedArray(view);
    
    if (!pBuf) {
      throw new Error(`Failed to allocate ${arrayBuffer.byteLength} bytes in WASM memory. The file might be too large for the browser's current memory limits.`);
    }

    const rc = sqlite3.capi.sqlite3_deserialize(
      sourceDb.pointer, 
      "main", 
      pBuf, 
      arrayBuffer.byteLength, 
      arrayBuffer.byteLength,
      sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_READONLY
    );

    if (rc !== 0) {
      throw new Error(`Deserialize failed (code ${rc})`);
    }

    console.log('Step 4: LRCAT loaded into memory');

    // Stage 3: Stabilization Pragmas
    // We MUST apply these AFTER loading the data, context is replaced by deserialize.
    console.log('Step 5: Applying strict memory pragmas to source DB...');
    sourceDb.exec([
      "PRAGMA temp_store = 2;",       // Store temp tables in memory
      "PRAGMA journal_mode = OFF;",    // Disable journaling entirely for the source
      "PRAGMA cache_size = -128000;",  // 128MB cache for faster sorting
      "PRAGMA locking_mode = EXCLUSIVE;"
    ].join(' '));

    const { RAW_DATA_QUERY } = await import('./queries.js');
    const rows = [];
    console.log('Step 6: Extracting data from LRCAT (this may take a few seconds)...');
    
    try {
      sourceDb.exec({
        sql: RAW_DATA_QUERY,
        rowMode: 'object',
        callback: (row) => rows.push(row),
      });
    } catch (e) {
      console.error('Extraction failed at Step 6:', e);
      throw e;
    }

    console.log(`Step 7: Extracted ${rows.length} rows`);

    if (rows.length === 0) throw new Error('No data found in LRCAT');

    // Stage 4: Transfer to Persistent/Primary DB
    console.log('Step 8: Rebuilding local analytics table...');
    destDb.exec('DROP TABLE IF EXISTS Lightroom_raw');
    
    const columns = Object.keys(rows[0]);
    const colDefs = columns.map(col => `"${col}" TEXT`).join(', ');
    destDb.exec(`CREATE TABLE Lightroom_raw (${colDefs})`);

    console.log('Step 9: Batch inserting rows...');
    const placeholders = columns.map(() => '?').join(', ');
    const insertStmt = destDb.prepare(`INSERT INTO Lightroom_raw VALUES (${placeholders})`);
    
    try {
      destDb.transaction(() => {
        for (const row of rows) {
          insertStmt.bind(Object.values(row)).stepReset();
        }
      });
    } finally {
      insertStmt.finalize();
    }

    console.log('--- IMPORT SUCCESSFUL ---');
    return { success: true, count: rows.length };
  } catch (err) {
    console.error('CRITICAL IMPORT ERROR:', err);
    const msg = err.message || 'Unknown error';
    throw new Error(`Import failed: ${msg}`);
  } finally {
    if (sourceDb) {
      try { sourceDb.close(); } catch(e) {}
    }
  }
};
