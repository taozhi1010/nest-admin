export function apiTempalte(options){
    // console.log('options',options);
    
    const {BusinessName,moduleName,functionName,businessName,primaryKey} = options
    return `
    import request from '@/utils/request'
    // 查询${functionName}列表
    export function list${BusinessName}(query) {
    return request({
        url: '/${moduleName}/${businessName}/list',
        method: 'get',
        params: query
    })
    }
    // 查询${functionName}详细
    export function get${BusinessName}(${primaryKey}) {
    return request({
        url: '/${moduleName}/${businessName}/' + ${primaryKey},
        method: 'get'
    })
    }
    
    // 新增${functionName}
    export function add${BusinessName}(data) {
    return request({
        url: '/${moduleName}/${businessName}',
        method: 'post',
        data: data
    })
    }

    // 修改${functionName}
    export function update${BusinessName}(data) {
    return request({
        url: '/${moduleName}/${businessName}',
        method: 'put',
        data: data
    })
    }

    // 删除${functionName}
    export function del${BusinessName}(${primaryKey}) {
    return request({
        url: '/${moduleName}/${businessName}/' + ${primaryKey},
        method: 'delete'
    })
    }

    `
}
