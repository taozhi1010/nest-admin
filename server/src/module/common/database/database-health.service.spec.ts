import { DatabaseHealthService } from './database-health.service';

describe('DatabaseHealthService', () => {
  const dataSource = { query: jest.fn() };
  let service: DatabaseHealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DatabaseHealthService(dataSource as any);
  });

  const check = () => (service as any).check();
  const isHealthy = () => (service as any).healthy;
  const transientError = () => Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });

  it('第一条连接失效时立即重试并保持健康', async () => {
    dataSource.query.mockRejectedValueOnce(transientError()).mockResolvedValueOnce([{ '1': 1 }]);

    await check();

    expect(dataSource.query).toHaveBeenCalledTimes(2);
    expect(isHealthy()).toBe(true);
  });

  it('连续失败时不抛出异常，等待下一轮自动重试', async () => {
    dataSource.query.mockRejectedValue(transientError());

    await expect(check()).resolves.toBeUndefined();

    expect(dataSource.query).toHaveBeenCalledTimes(2);
    expect(isHealthy()).toBe(false);
  });

  it('恢复后重新标记为健康', async () => {
    dataSource.query.mockRejectedValueOnce(transientError()).mockRejectedValueOnce(transientError());
    await check();
    expect(isHealthy()).toBe(false);

    dataSource.query.mockResolvedValueOnce([{ '1': 1 }]);
    await check();

    expect(isHealthy()).toBe(true);
  });
});
