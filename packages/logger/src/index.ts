import winston, { format } from "winston";

const { combine, timestamp, printf, colorize } = format;

const myFormat = (name?: string) => {
  return printf(({ level, message, timestamp }) => {
    return `${timestamp} ${name} ${level}: ${message}`;
  });
};

winston.format.combine(winston.format.colorize(), winston.format.json());

export const createLogger = (name?: string) => {
  return winston.createLogger({
    level: "info",
    format: combine(
      colorize(),
      timestamp({ format: "HH:mm:ss" }),
      myFormat(name)
    ),
    transports: [new winston.transports.Console()],
  });
};

export type LoggerType = winston.Logger;
