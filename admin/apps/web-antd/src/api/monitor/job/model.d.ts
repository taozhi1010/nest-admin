export interface JobVO {
  jobId: number | string;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  misfirePolicy: string;
  concurrent: string;
  status: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  nextValidTime?: string;
}

export interface JobLogVO {
  jobLogId: number | string;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  jobMessage: string;
  status: string;
  exceptionInfo: string;
  createTime: string;
}

export interface JobQuery extends BasePageQuery {
  jobName?: string;
  jobGroup?: string;
  status?: string;
}

export interface JobLogQuery extends BasePageQuery {
  jobName?: string;
  jobGroup?: string;
  status?: string;
  params?: {
    beginTime?: string;
    endTime?: string;
  };
} 