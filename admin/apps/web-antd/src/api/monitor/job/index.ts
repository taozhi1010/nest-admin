import type { JobVO, JobLogVO } from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
	jobList = '/monitor/job/list',
	jobLogList = '/monitor/jobLog/list',
	jobLogClean = '/monitor/jobLog/clean',
	jobLogExport = '/monitor/jobLog/export',
	jobExport = '/monitor/job/export',
	jobRoot = '/monitor/job',
	jobLogRoot = '/monitor/jobLog',
	jobChangeStatus = '/monitor/job/changeStatus'
}

// 定时任务相关接口
export function listJob(params?: PageQuery) {
	return requestClient.get<PageResult<JobVO>>(Api.jobList, { params });
}

export function getJob(jobId: string | number) {
	return requestClient.get<JobVO>(`${Api.jobRoot}/${jobId}`);
}

export function addJob(data: Omit<JobVO, 'jobId'>) {
	return requestClient.postWithMsg(Api.jobRoot, data);
}

export function updateJob(data: JobVO) {
	return requestClient.putWithMsg(`${Api.jobRoot}/${data.jobId}`, data);
}

export function delJob(jobIds: IDS) {
	return requestClient.deleteWithMsg(`${Api.jobRoot}/${jobIds}`);
}

export function changeJobStatus(jobId: string | number, status: string) {
	return requestClient.putWithMsg(Api.jobChangeStatus, { jobId, status });
}

export function runJob(jobId: string | number, jobGroup: string) {
	return requestClient.putWithMsg(`${Api.jobRoot}/${jobId}/run`, { jobId, jobGroup });
}

export function jobExport(params?: PageQuery) {
	return commonExport(Api.jobExport, params ?? {});
}

// 调度日志相关接口
export function listJobLog(params?: PageQuery) {
	return requestClient.get<PageResult<JobLogVO>>(Api.jobLogList, { params });
}

export function delJobLog(jobLogIds: IDS) {
	return requestClient.deleteWithMsg(`${Api.jobLogRoot}/${jobLogIds}`);
}

export function cleanJobLog() {
	return requestClient.deleteWithMsg(Api.jobLogClean);
}

export function jobLogExport(params?: PageQuery) {
	return commonExport(Api.jobLogExport, params ?? {});
} 