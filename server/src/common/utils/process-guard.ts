import { Logger } from '@nestjs/common';

const TRANSIENT_CONNECTION_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ETIMEDOUT',
  'EPIPE',
  'EAI_AGAIN',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_SEQUENCE_TIMEOUT',
]);

export function isTransientConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const { code, errno, cause } = error as { code?: unknown; errno?: unknown; cause?: unknown };
  if (typeof code === 'string' && TRANSIENT_CONNECTION_CODES.has(code)) {
    return true;
  }
  if (typeof errno === 'string' && TRANSIENT_CONNECTION_CODES.has(errno)) {
    return true;
  }
  return isTransientConnectionError(cause);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return typeof error === 'string' ? error : JSON.stringify(error);
}

export function setupProcessGuards() {
  const logger = new Logger('ProcessGuard');

  // 网络抖动或数据库重连期间产生的瞬时错误不应让整个服务退出
  process.on('uncaughtException', (error) => {
    if (isTransientConnectionError(error)) {
      logger.warn(`捕获到可恢复的连接错误，服务继续运行：${error.message}`);
      return;
    }
    logger.error(`未捕获异常，服务即将退出：${error.stack ?? error.message}`);
    setTimeout(() => process.exit(1), 100);
  });

  process.on('unhandledRejection', (reason) => {
    if (isTransientConnectionError(reason)) {
      logger.warn(`捕获到可恢复的连接错误（Promise），服务继续运行：${errorMessage(reason)}`);
      return;
    }
    logger.error(`未处理的 Promise 异常：${errorMessage(reason)}`);
  });
}
