import { Catch, HttpException, ExceptionFilter, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';

/**
 * 全局异常过滤器，捕获所有异常（不只是 HttpException）
 * 统一返回 HTTP 200 + 业务 code，兼容前端 axios 拦截器约定
 */
@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      // HttpException：提取 status 与 message
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      // exceptionResponse 可能是 string、string[] 或 { message, error }
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const respMsg = (exceptionResponse as any).message;
        if (Array.isArray(respMsg)) {
          // ValidationPipe 校验失败返回数组
          message = respMsg[0];
        } else if (respMsg) {
          message = respMsg;
        } else {
          message = (exceptionResponse as any).error || message;
        }
      }
    } else {
      // 非 HttpException（如 TypeError、QueryFailedError 等）：记录完整堆栈便于排查
      this.logger.error(`未处理异常: ${exception?.message || exception}`, exception?.stack, request?.url);
      message = exception?.message || '服务器内部错误';
    }

    response.status(200).json({
      code: status,
      msg: message,
      data: null,
    });
  }
}
