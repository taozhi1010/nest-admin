import { isTransientConnectionError } from './process-guard';

describe('isTransientConnectionError', () => {
  it('识别 ECONNRESET', () => {
    const error = Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });
    expect(isTransientConnectionError(error)).toBe(true);
  });

  it('识别 PROTOCOL_CONNECTION_LOST', () => {
    expect(isTransientConnectionError({ code: 'PROTOCOL_CONNECTION_LOST' })).toBe(true);
  });

  it('识别嵌套在 cause 中的连接错误', () => {
    const error = new Error('Query failed', {
      cause: Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }),
    });
    expect(isTransientConnectionError(error)).toBe(true);
  });

  it('普通业务错误返回 false', () => {
    expect(isTransientConnectionError(Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' }))).toBe(false);
  });

  it('空值返回 false', () => {
    expect(isTransientConnectionError(null)).toBe(false);
    expect(isTransientConnectionError(undefined)).toBe(false);
  });
});
