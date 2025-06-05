import * as winston from 'winston'

const isProduction = () => process.env.NODE_ENV === 'production'

const development = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, who, what, where, why, ...meta }) => {
    // 'what' is the main message
    const whatPart = what || message
    const whoPart = who ? ` [Who: ${who}]` : ''
    const wherePart = where ? ` [Where: ${where}]` : ''
    const whyPart = why ? ` [Why: ${why}]` : '';
    const metaPart = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''

    return `[${timestamp}] ${level}: ${whatPart}${whoPart}${wherePart}${whyPart}${metaPart}`
  }),
)

const production = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json({ 
    // Ensure all 5 W's are included in production logs
    replacer: (key, value) => {
      if (['who', 'what', 'when', 'where', 'why'].includes(key)) {
        return value
      }
      // Include other relevant metadata
      return value
    }
  })
)

export const buildLogger = () =>
  winston.createLogger({
    level: 'debug',
    exitOnError: false,
    transports: [new winston.transports.Console()],
    format: isProduction() ? production : development,
  });

export const logger = buildLogger()