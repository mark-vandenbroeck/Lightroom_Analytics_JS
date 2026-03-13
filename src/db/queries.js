export const RAW_DATA_QUERY = `
WITH ModCount AS (
    SELECT
        image
        ,COUNT(name) AS EditCount
    FROM Adobe_libraryImageDevelopHistoryStep
    WHERE 1=1
    AND Adobe_libraryImageDevelopHistoryStep.name NOT LIKE 'Export%'
    AND Adobe_libraryImageDevelopHistoryStep.name NOT LIKE 'Import%'
    AND Adobe_libraryImageDevelopHistoryStep.name NOT LIKE 'Print%'
    GROUP BY image
)
SELECT
    AgLibraryRootFolder.name AS RootFolderName,
    AgLibraryFolder.pathFromRoot AS PathFromRoot,
    AgLibraryFile.baseName AS BaseName,
    AgLibraryFile.extension AS FileType,
    Adobe_images.captureTime as CaptureTime,
    AgLibraryFile.originalFilename AS OriginalFileName,
    COALESCE(Adobe_images.rating,0) AS Rating,
    Adobe_images.colorLabels AS ColorLabel,
    Adobe_images.touchCount AS TouchCount,
    AgHarvestedExifMetadata.focalLength AS FocalLength,
    ROUND(AgHarvestedExifMetadata.aperture,3) AS Aperture,
    AgHarvestedExifMetadata.shutterSpeed AS ShutterSpeed,
    ROUND(AgHarvestedExifMetadata.isoSpeedRating,0) AS ISO,
    COALESCE(AgInternedExifCameraModel.value,'Unknown camera') AS Camera,
    COALESCE(AgInternedExifLens.value,'Unknown lens') AS Lens,
    Adobe_images.pick,
    COALESCE(ModCount.EditCount,0) AS EditCount
FROM
    AgLibraryFile
    LEFT JOIN AgLibraryFolder ON AgLibraryFolder.id_local=AgLibraryFile.folder
    LEFT JOIN AgLibraryRootFolder ON AgLibraryRootFolder.id_local=AgLibraryFolder.rootFolder
    LEFT JOIN Adobe_images ON AgLibraryFile.id_local=Adobe_images.rootFile
    LEFT JOIN AgHarvestedExifMetadata ON AgHarvestedExifMetadata.image = Adobe_images.id_local
    LEFT JOIN AgInternedExifCameraModel ON AgInternedExifCameraModel.id_local = AgHarvestedExifMetadata.cameraModelRef
    LEFT JOIN AgInternedExifLens ON AgInternedExifLens.id_local = AgHarvestedExifMetadata.lensRef
    LEFT JOIN ModCount ON ModCount.image = Adobe_images.id_local
`;

export const CREATE_RAW_TABLE = (columns) => {
  const colDefs = columns.map(col => `"${col}" TEXT`).join(', ');
  return `CREATE TABLE IF NOT EXISTS Lightroom_raw (${colDefs})`;
};

export const EXPLORE_METRICS_QUERY = (camera, lens, start, end) => {
  let query = `
    SELECT
      strftime('%Y-%m', CaptureTime) as month,
      COUNT(*) as total_photos,
      SUM(CASE WHEN pick = 1 THEN 1 ELSE 0 END) as pick_count
    FROM Lightroom_raw lr
    LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName
    WHERE CaptureTime IS NOT NULL
  `;
  const params = [];
  if (start) { query += " AND strftime('%Y-%m', CaptureTime) >= ?"; params.push(start); }
  if (end) { query += " AND strftime('%Y-%m', CaptureTime) <= ?"; params.push(end); }
  if (camera) { query += " AND Camera = ?"; params.push(camera); }
  if (lens) { query += " AND COALESCE(lm.GroupName, lr.Lens) = ?"; params.push(lens); }

  query += " GROUP BY month ORDER BY month ASC";
  return { sql: query, params };
};

export const CAMERA_DISTRIBUTION_QUERY = `
  SELECT Camera, COUNT(*) as count
  FROM Lightroom_raw
  WHERE Camera IS NOT NULL
  GROUP BY Camera
  ORDER BY count DESC
`;

export const LENS_DISTRIBUTION_QUERY = `
  SELECT COALESCE(lm.GroupName, lr.Lens) as Lens, COUNT(*) as count
  FROM Lightroom_raw lr
  LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName
  WHERE lr.Lens IS NOT NULL
  GROUP BY Lens
  ORDER BY count DESC
`;

export const FOCAL_HISTOGRAM_QUERY = `
  SELECT
    CAST(ROUND(FocalLength) AS INTEGER) as label,
    COUNT(*) as count
  FROM Lightroom_raw
  WHERE FocalLength IS NOT NULL
  GROUP BY label
  ORDER BY label ASC
`;

export const APERTURE_DISTRIBUTION_QUERY = `
  SELECT
    Aperture as label,
    COUNT(*) as count
  FROM Lightroom_raw
  WHERE Aperture IS NOT NULL
  GROUP BY label
  ORDER BY CAST(label AS REAL) ASC
`;

export const SHUTTER_SPEED_DISTRIBUTION_QUERY = `
  SELECT
    1.0 / POWER(2, ShutterSpeed) as label,
    COUNT(*) as count
  FROM Lightroom_raw
  WHERE ShutterSpeed IS NOT NULL AND CAST(ShutterSpeed AS REAL) >= 0
  GROUP BY label
  ORDER BY CAST(label AS REAL) DESC
`;

export const ISO_DISTRIBUTION_QUERY = `
  SELECT 
    ISO as label,
    COUNT(*) as count
  FROM Lightroom_raw
  WHERE ISO IS NOT NULL AND CAST(ISO AS INTEGER) <= 10000
  GROUP BY label
  ORDER BY CAST(label AS INTEGER) ASC
`;

export const HIT_RATE_BY_FOCAL_QUERY = `
  SELECT 
    CAST(ROUND(FocalLength) AS INTEGER) as label, 
    COUNT(*) as total_photos,
    SUM(CASE WHEN pick = 1 THEN 1 ELSE 0 END) as pick_count
  FROM Lightroom_raw
  WHERE FocalLength IS NOT NULL
  GROUP BY label
  HAVING total_photos >= 10
  ORDER BY label ASC
`;

export const CORRELATION_QUERY = `
  SELECT 
    Aperture,
    1.0 / POWER(2, ShutterSpeed) as shutter_sec,
    ISO
  FROM Lightroom_raw
  WHERE Aperture IS NOT NULL AND ShutterSpeed IS NOT NULL AND ISO IS NOT NULL
  AND CAST(ISO AS INTEGER) <= 10000 AND CAST(ShutterSpeed AS REAL) >= 0
`;

export const RATINGS_QUERY = `
  SELECT 
    Rating as label,
    COUNT(*) as count
  FROM Lightroom_raw
  GROUP BY label
  ORDER BY label ASC
`;

export const AVG_EDITS_LENS_QUERY = `
  SELECT 
    Lens as label,
    AVG(EditCount) as avg_edits
  FROM Lightroom_raw
  GROUP BY label
  HAVING COUNT(*) >= 20
  ORDER BY avg_edits DESC
  LIMIT 15
`;

export const AVG_EDITS_CAMERA_QUERY = `
  SELECT 
    Camera as label,
    AVG(EditCount) as avg_edits
  FROM Lightroom_raw
  GROUP BY label
  HAVING COUNT(*) >= 20
  ORDER BY avg_edits DESC
  LIMIT 10
`;

export const GET_MAPPINGS_QUERY = `
  SELECT DISTINCT lr.Lens as OriginalName, lm.GroupName, COUNT(*) as count
  FROM Lightroom_raw lr
  LEFT JOIN LensMappings lm ON lr.Lens = lm.OriginalName
  GROUP BY lr.Lens
  ORDER BY count DESC
`;
