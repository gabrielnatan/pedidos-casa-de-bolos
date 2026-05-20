import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  base: { service: "pedidos-casa-de-bolos" },
  redact: {
    paths: ["req.headers.authorization", "*.password", "*.token"],
    censor: "[REDACTED]",
  },
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
    },
  }),
});
