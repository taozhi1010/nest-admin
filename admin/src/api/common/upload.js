import request from '@/utils/request';

// 查询缓存详细
export function uploadChunk(data) {
    return request({
        url: '/common/upload/chunk',
        method: 'post',
        data
    });
}

// 查询缓存详细
export function upload(data) {
    return request({
        url: '/common/upload',
        method: 'post',
        data
    });
}


// 查询缓存详细
export function mergeChunk(data) {
    return request({
        url: '/common/upload/chunk/merge',
        method: 'post',
        data
    });
}


// 查询缓存详细
export function getUploadId(data) {
    return request({
        url: '/common/upload/chunk/uploadId',
        method: 'get',
        data
    })
}

