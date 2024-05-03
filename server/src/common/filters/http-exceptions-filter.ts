import { Catch, HttpException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(200).json({
      code: status,
      msg: exceptionResponse?.message ? exception.message : 'Service Error',
      data: null,
    });
  }
}
