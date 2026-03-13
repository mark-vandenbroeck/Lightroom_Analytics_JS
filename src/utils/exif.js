/**
 * Formats seconds into human-readable shutter speed (e.g. 1/200 s or 2.5 s)
 * @param {number} seconds 
 * @returns {string}
 */
export const formatShutterSpeed = (seconds) => {
  if (seconds === null || seconds === undefined || seconds === 0) return '-';
  if (seconds >= 0.5) {
    return `${Math.round(seconds * 10) / 10} s`;
  }
  return `1/${Math.round(1 / seconds)} s`;
};

/**
 * Formats aperture into human-readable string (e.g. f/2.8)
 * @param {number} aperture 
 * @returns {string}
 */
export const formatAperture = (aperture) => {
  if (aperture === null || aperture === undefined) return '-';
  return `f/${aperture}`;
};

/**
 * Converts ShutterSpeed (APEX value) to human-readable seconds and fractional notation.
 * @param {number} apexValue 
 * @returns {{seconds: number, formatted: string}}
 */
export const apexToShutterSpeed = (apexValue) => {
  if (apexValue === null || apexValue === undefined) return { seconds: 0, formatted: '0s' };
  
  const seconds = 1.0 / Math.pow(2, apexValue);
  
  let formatted = '';
  if (seconds >= 1) {
    formatted = `${Math.round(seconds * 10) / 10}s`;
  } else {
    formatted = `1/${Math.round(1 / seconds)}`;
  }
  
  return { seconds, formatted };
};

/**
 * Categorizes shutter speed into buckets.
 * @param {number} seconds 
 * @returns {string}
 */
export const categorizeShutterSpeed = (seconds) => {
  if (seconds <= 0.001) return 'Action (< 1/1000s)';
  if (seconds <= 0.01) return 'Fast (1/1000s - 1/100s)';
  if (seconds <= 0.1) return 'Handheld (1/100s - 1/10s)';
  if (seconds <= 1.0) return 'Slow (1/10s - 1s)';
  return 'Long Exposure (> 1s)';
};

/**
 * Categorizes aperture into buckets.
 * @param {number} aperture 
 * @returns {string}
 */
export const categorizeAperture = (aperture) => {
  if (aperture < 2.8) return '< f/2.8';
  if (aperture < 4.0) return 'f/2.8 - f/4';
  if (aperture < 5.6) return 'f/4 - f/5.6';
  if (aperture < 8.0) return 'f/5.6 - f/8';
  if (aperture < 11.0) return 'f/8 - f/11';
  return '>= f/11';
};
