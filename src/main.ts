import { logger } from "@/infrastructure/logger/logger.js";

logger.info({ port: 3000 }, "servidor iniciando");
logger.error({ err: new Error("boom") }, "falhou");
