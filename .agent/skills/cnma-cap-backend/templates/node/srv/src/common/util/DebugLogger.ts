/**
 * DebugLogger.ts
 * Wrapper for cds.log that adds [DEBUG] prefix to debug-level logs
 * for easier identification in mixed-level log output.
 */
import cds from '@sap/cds';

// Debug prefix for easy identification
const DEBUG_PREFIX = '[DEBUG]';

// Type for log level methods
type _LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * Creates a debug-aware logger that prefixes debug messages with [DEBUG].
 * Usage: const Logger = createDebugLogger('my-module');
 *        LOG.debug('message'); // outputs: [my-module] - [DEBUG] message
 */
export function createDebugLogger(module: string) {
    const baseLog = cds.log(module);

    return {
        // Pass through non-debug methods unchanged
        trace: (...args: unknown[]) => baseLog.trace(...args),
        info: (...args: unknown[]) => baseLog.info(...args),
        warn: (...args: unknown[]) => baseLog.warn(...args),
        error: (...args: unknown[]) => baseLog.error(...args),
        log: (...args: unknown[]) => baseLog.log(...args),

        // Wrap debug to add prefix
        debug: (message: string, ...args: unknown[]) => {
            // Optimization: check if debug is enabled before creating string
            if (baseLog._debug) {
                baseLog.debug(`${DEBUG_PREFIX} ${message}`, ...args);
            }
        },

        // Expose underlying logger for advanced usage
        _base: baseLog,

        // Check if debug is enabled (for expensive debug logging)
        get _debug() { return baseLog._debug; }
    };
}

/**
 * Alternative: Patch an existing cds.log instance to add debug prefix.
 * Usage: const Logger = patchDebugLogger(cds.log('my-module'));
 */
export function patchDebugLogger(log: ReturnType<typeof cds.log>) {
    const originalDebug = log.debug.bind(log);

    log.debug = (message: string, ...args: unknown[]) => {
        originalDebug(`${DEBUG_PREFIX} ${message}`, ...args);
    };

    return log;
}

export default createDebugLogger;
