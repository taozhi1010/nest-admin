import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenTableEntity } from './entities/gen-table.entity';
import { GenTableColumnEntity } from './entities/gen-table-cloumn.entity';
import { ToolController } from './tool.controller';
import { ToolService } from './tool.service';

@Module({
	imports: [TypeOrmModule.forFeature([GenTableEntity, GenTableColumnEntity])],
	controllers: [ToolController],
	providers: [ToolService],
})
export class ToolModule {}
