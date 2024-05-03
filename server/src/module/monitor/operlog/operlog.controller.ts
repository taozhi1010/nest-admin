import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OperlogService } from './operlog.service';
import { CreateOperlogDto } from './dto/create-operlog.dto';
import { UpdateOperlogDto } from './dto/update-operlog.dto';

@Controller('monitor/operlog')
export class OperlogController {
  constructor(private readonly operlogService: OperlogService) {}

  @Post()
  create(@Body() createOperlogDto: CreateOperlogDto) {
    return this.operlogService.create(createOperlogDto);
  }

  @Get()
  findAll() {
    return this.operlogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operlogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperlogDto: UpdateOperlogDto) {
    return this.operlogService.update(+id, updateOperlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operlogService.remove(+id);
  }
}
