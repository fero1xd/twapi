import winston, { format } from "winston";

const { combine, timestamp, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});


winston.format.combine(winston.format.colorize(), winston.format.json());

export const logger = winston.createLogger({
  level: "info",
  format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), myFormat),
  transports: [new winston.transports.Console()],
});
