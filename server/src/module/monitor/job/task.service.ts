import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Task, TaskRegistry } from 'src/common/decorators/task.decorator';
import { JobLogService } from './job-log.service';

@Injectable()
export class TaskService implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);
  // eslint-disable-next-line @typescript-eslint/ban-types
  private readonly taskMap = new Map<string, Function>();
  private serviceInstances = new Map<string, any>();

  constructor(
    private moduleRef: ModuleRef,
    private jobLogService: JobLogService,
  ) {}

  onModuleInit() {
    this.initializeTasks();
  }

  /**
   * 初始化任务映射
   */
  private async initializeTasks() {
    const tasks = TaskRegistry.getInstance().getTasks();

    // 打印所有模块

    for (const { classOrigin, methodName, metadata } of tasks) {
      try {
        // 获取或创建服务实例
        let serviceInstance = this.serviceInstances.get(classOrigin.name);
        if (!serviceInstance) {
          // 动态获取服务实例
          serviceInstance = await this.moduleRef.get(classOrigin);
          this.serviceInstances.set(classOrigin.name, serviceInstance);
        }

        // 绑定方法到实例
        const method = serviceInstance[methodName].bind(serviceInstance);
        this.taskMap.set(metadata.name, method);
        this.logger.log(`注册任务: ${metadata.name}`);
      } catch (error) {
        this.logger.error(`注册任务失败 ${metadata.name}: ${error.message}`);
      }
    }
  }

  /**
   * 获取所有已注册的任务
   */
  getTasks() {
    return Array.from(this.taskMap.keys());
  }

  /**
   * 执行任务并记录日志
   */
  async executeTask(invokeTarget: string, jobName?: string, jobGroup?: string) {
    const startTime = new Date();
    let status = '0';
    let jobMessage = '执行成功';
    let exceptionInfo = '';

    try {
      // 使用正则表达式解析函数名和参数
      const regex = /^([^(]+)(?:\((.*)\))?$/;
      const match = invokeTarget.match(regex);

      if (!match) {
        throw new Error('调用目标格式错误');
      }

      const [, methodName, paramsStr] = match;
      const params = paramsStr ? this.parseParams(paramsStr) : [];

      // 获取任务方法
      const taskFn = this.taskMap.get(methodName);
      if (!taskFn) {
        throw new Error(`任务 ${methodName} 不存在`);
      }
      // 执行任务
      await taskFn(...params);
      return true;
    } catch (error) {
      status = '1';
      jobMessage = '执行失败';
      exceptionInfo = error.message;
      this.logger.error(`执行任务失败: ${error.message}`);
      return false;
    } finally {
      // 记录日志
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      await this.jobLogService.addJobLog({
        jobName: jobName || '未知任务',
        jobGroup: jobGroup || 'DEFAULT',
        invokeTarget,
        status,
        jobMessage: `${jobMessage}，耗时 ${duration}ms`,
        exceptionInfo,
        createTime: startTime,
      });
    }
  }

  /**
   * 解析参数字符串
   * 支持以下格式:
   * - 字符串: 'text' 或 "text"
   * - 数字: 123 或 123.45
   * - 布尔值: true 或 false
   * - null
   * - undefined
   * - 数组: [1, 'text', true]
   * - 对象: {a: 1, b: 'text'}
   */
  private parseParams(paramsStr: string): any[] {
    if (!paramsStr.trim()) {
      return [];
    }

    try {
      // 将单引号替换为双引号
      const normalizedStr = paramsStr
        .replace(/'/g, '"')
        // 处理未加引号的字符串
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

      // 尝试解析为 JSON
      return Function(`return [${normalizedStr}]`)();
    } catch (error) {
      this.logger.error(`解析参数失败: ${error.message}`);
      return [];
    }
  }

  @Task({
    name: 'task.noParams',
    description: '无参示例任务',
  })
  async ryNoParams() {
    this.logger.log('执行无参示例任务');
  }

  @Task({
    name: 'task.params',
    description: '有参示例任务',
  })
  async ryParams(param1: string, param2: number, param3: boolean) {
    this.logger.log(`执行有参示例任务，参数：${JSON.stringify({ param1, param2, param3 })}`);
  }

  @Task({
    name: 'task.clearTemp',
    description: '清理临时文件',
  })
  async clearTemp() {
    this.logger.log('执行清理临时文件任务');
    // 实现清理临时文件的逻辑
  }

  @Task({
    name: 'task.monitorSystem',
    description: '系统状态监控',
  })
  async monitorSystem() {
    this.logger.log('执行系统状态监控任务');
    // 实现系统监控的逻辑
  }

  @Task({
    name: 'task.backupDatabase',
    description: '数据库备份',
  })
  async backupDatabase() {
    this.logger.log('执行数据库备份任务');
    // 实现数据库备份的逻辑
  }
}
