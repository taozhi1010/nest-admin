import { SetMetadata } from '@nestjs/common';

export const TASK_METADATA = 'task_metadata';

export interface TaskMetadata {
  name: string;
  description?: string;
}

// 全局任务注册表
export class TaskRegistry {
  private static instance: TaskRegistry;
  private tasks = new Map<
    string,
    {
      classOrigin: any; // 添加类名，用于查找服务实例
      methodName: string;
      metadata: TaskMetadata;
    }
  >();

  private constructor() {}

  static getInstance(): TaskRegistry {
    if (!TaskRegistry.instance) {
      TaskRegistry.instance = new TaskRegistry();
    }
    return TaskRegistry.instance;
  }

  register(target: any, methodName: string, metadata: TaskMetadata) {
    // 获取类名
    const classOrigin = target.constructor;
    this.tasks.set(metadata.name, { classOrigin, methodName, metadata });
  }

  getTasks() {
    return Array.from(this.tasks.values());
  }

  getTask(name: string) {
    return this.tasks.get(name);
  }
}

/**
 * 任务装饰器
 * @param metadata 任务元数据
 */
export const Task = (metadata: TaskMetadata): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // 注册到元数据
    SetMetadata(TASK_METADATA, metadata)(target, propertyKey, descriptor);

    // 注册到全局注册表
    TaskRegistry.getInstance().register(target, propertyKey.toString(), metadata);

    return descriptor;
  };
};
