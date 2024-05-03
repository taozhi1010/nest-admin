import { Injectable } from '@nestjs/common';
import { CreateOperlogDto } from './dto/create-operlog.dto';
import { UpdateOperlogDto } from './dto/update-operlog.dto';

@Injectable()
export class OperlogService {
  create(createOperlogDto: CreateOperlogDto) {
    return 'This action adds a new operlog';
  }

  findAll() {
    return `This action returns all operlog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} operlog`;
  }

  update(id: number, updateOperlogDto: UpdateOperlogDto) {
    return `This action updates a #${id} operlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} operlog`;
  }
}
