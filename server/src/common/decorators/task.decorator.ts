import { SetMetadata } from '@nestjs/common';

export const TASK_METADATA = 'task_metadata';

export interface TaskMetadata {
  name: string;
  description?: string;
}

/**
 * 任务装饰器
 * @param metadata 任务元数据
 */
export const Task = (metadata: TaskMetadata): MethodDecorator => {
  return SetMetadata(TASK_METADATA, metadata);
};
