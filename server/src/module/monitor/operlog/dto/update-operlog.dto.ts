import { PartialType } from '@nestjs/swagger';
import { CreateOperlogDto } from './create-operlog.dto';

export class UpdateOperlogDto extends PartialType(CreateOperlogDto) {}
