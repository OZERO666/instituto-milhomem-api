const logger = {
  error: (...args) => {
    console.error('[ERROR]', ...args); // ← stderr, não stdout
  },
  fatal: (...args) => {
    console.error('[FATAL]', ...args);
  },
  info: (...args) => {
    console.log('[INFO]', ...args);
  },
  debug: (...args) => {
    console.log('[DEBUG]', ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args); // ← console.warn, não log
  }
};

export default logger;
export { logger };