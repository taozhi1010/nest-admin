import { ArgumentMetadata, Injectable, PipeTransform, HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class MYValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // 如果没有传入验证规则，则不验证，直接返回数据
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    // 将对象转换为 Class 来验证
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    // const errors = await validate(object, {
    //   forbidUnknownValues: true, //尝试验证未知对象会立即失败
    //   forbidNonWhitelisted: true, //不会去掉非白名单的属性，而是会抛出异常
    //   whitelist: true, //验证器将去掉没有使用任何验证装饰器的属性的验证（返回的）对象
    // });

    if (errors.length > 0) {
      //获取第一个错误并且直接返回  上线待修改
      const msg = Object.values(errors[0].constraints)[0];
      // 统一抛出异常
      throw new HttpException({ message: msg }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
