import { PartialType } from '@nestjs/swagger';
import { CreateToolDto } from './create-tool.dto';

export class UpdateToolDto extends PartialType(CreateToolDto) {}
