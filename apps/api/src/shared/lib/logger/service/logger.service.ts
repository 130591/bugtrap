import {
  Injectable,
  LoggerService as NestLoggerService,
  LogLevel,
} from '@nestjs/common';
import { logger } from '../winston.logger'

@Injectable()
export class LoggerService implements NestLoggerService {
  /**
   * Logs an informational message.
   * @param message The main message of the log (What).
   * @param optionalParams An object containing optional 'who', 'where', 'why' properties, and any other extra metadata.
   */
  log(message: any, ...optionalParams: any[]) {
    const { who, where, why, ...extra } = optionalParams[0] || {}
    logger.info(message, { who, what: message, where, why, ...extra })
  }

  /**
   * Logs an error message.
   * @param message The main message of the log (What).
   * @param optionalParams An object containing optional 'who', 'where', 'why' properties, and any other extra metadata.
   */
  error(message: any, ...optionalParams: any[]) {
    const { who, where, why, ...extra } = optionalParams[0] || {}
    logger.error(message, { who, what: message, where, why, ...extra })
  }

  /**
   * Logs a warning message.
   * @param message The main message of the log (What).
   * @param optionalParams An object containing optional 'who', 'where', 'why' properties, and any other extra metadata.
   */
  warn(message: any, ...optionalParams: any[]) {
    const { who, where, why, ...extra } = optionalParams[0] || {}
    logger.warn(message, { who, what: message, where, why, ...extra })
  }

  /**
   * Logs a debug message.
   * @param message The main message of the log (What).
   * @param optionalParams An object containing optional 'who', 'where', 'why' properties, and any other extra metadata.
   */
  debug(message: any, ...optionalParams: any[]) {
    const { who, where, why, ...extra } = optionalParams[0] || {}
    logger.debug(message, { who, what: message, where, why, ...extra })
  }

  /**
   * Logs a verbose message.
   * @param message The main message of the log (What).
   * @param optionalParams An object containing optional 'who', 'where', 'why' properties, and any other extra metadata.
   */
  verbose(message: any, ...optionalParams: any[]) {
    const { who, where, why, ...extra } = optionalParams[0] || {}
    logger.verbose(message, { who, what: message, where, why, ...extra })
  }

  setLogLevels?(levels: LogLevel[]) {
    logger.level = levels[0]
  }
}