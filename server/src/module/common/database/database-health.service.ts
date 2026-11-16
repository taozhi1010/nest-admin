import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { isTransientConnectionError } from 'src/common/utils/process-guard';

const HEALTH_CHECK_INTERVAL_MS = 60_000;

@Injectable()
export class DatabaseHealthService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseHealthService.name);
  private timer?: NodeJS.Timeout;
  private checking = false;
  private healthy = true;

  constructor(private readonly dataSource: DataSource) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.check(), HEALTH_CHECK_INTERVAL_MS);
  }

  onApplicationShutdown() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async check() {
    if (this.checking) {
      return;
    }
    this.checking = true;
    try {
      await this.dataSource.query('SELECT 1');
      this.markHealthy();
    } catch (error) {
      if (!isTransientConnectionError(error)) {
        this.healthy = false;
        this.logger.error(`数据库健康检查失败：${(error as Error).message}`);
        return;
      }
      // 休眠或网络切换后连接池里可能残留失效连接，立即重试一次即可换到新连接
      try {
        await this.dataSource.query('SELECT 1');
        this.markHealthy();
      } catch (retryError) {
        if (this.healthy) {
          this.logger.warn(`数据库连接中断，将自动重试：${(retryError as Error).message}`);
        }
        this.healthy = false;
      }
    } finally {
      this.checking = false;
    }
  }

  private markHealthy() {
    if (!this.healthy) {
      this.logger.log('数据库连接已恢复');
      this.healthy = true;
    }
  }
}
