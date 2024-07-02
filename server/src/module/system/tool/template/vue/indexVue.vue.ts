export const indexVue = (options) => {
  const html = htmlTemplate(options);
  const script = indexScript(options);
  return `
  ${html}
  ${script}
  
  `;
};
const htmlTemplate = (options) => {
  const { columns, moduleName, businessName } = options;
  const queryTem = indexQueryTemplate(columns);
  const buttonTem = indexButtomTemplate(moduleName, businessName);
  const tableTem = indexTableTemplate(columns, businessName, moduleName);

  let html = '';

  html += `
    <template>
        <div class="app-container">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            ${queryTem}
            </el-form>
            ${buttonTem}
            <el-table v-loading="loading" :data="${businessName}List" >
             ${tableTem}
            </el-table>
            <pagination
                v-show="total>0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
            />
        </div>
        <index-dialog ref="indexDialogRef" @update="updateHandler"></index-dialog>
    </template>
    `;

  return html;
};

const indexScript = (options) => {
  const { columns, BusinessName, moduleName, businessName ,primaryKey} = options;
  const dicts = indexScriptDicts(columns);
  const exportScript = handlerExport(moduleName,businessName)
  let script = '';

  script += `
    <script setup name="${BusinessName}">
    import { list${BusinessName}, get${BusinessName}, del${BusinessName}, add${BusinessName}, update${BusinessName} } from "@/api/${moduleName}/${businessName}";
    import { getCurrentInstance,ref } from "vue"
    import indexDialog from "./components/indexDialog.vue";
    const { proxy } = getCurrentInstance();
    ${dicts}
    const queryParams = ref({
        pageNum: 1,
        pageSize: 10,
    });
    const loading = ref(true)
    const total = ref(0)
    const dataList = ref([])
    const indexDialogRef = ref(null)
    const queryRef = ref(null)
    const queryHandler = () => {
        queryParams.value.pageNum = 1;
        getList();
    };
    const getList = () => {
        loading.value = true
        list${BusinessName}(queryParams.value).then(({data,total:temTotal}) => {
           dataList.value = data;
           total.value = temTotal;
           loading.value = false
         });
    };
    const resetQuery = () => {
        proxy.resetForm("queryRef");
        queryHandler()
    };
    const handleUpdate = (row) => {
        demoDialogRef.value.openDialog(row);
    };
    const handleAdd = () => {
        demoDialogRef.value.openDialog();
    };
    const handleDelete = (row) => {
         proxy.$modal
          .confirm('是否确认删除编号为"' + row.${primaryKey} + '"的数据项?')
           .then(function () {
             return del${BusinessName}(row.${primaryKey});
           })
           .then(() => {
             getList();
            proxy.$modal.msgSuccess("删除成功");
           })
           .catch(() => {});
      };
      const updateHandler = () => {
        queryHandler();
      };
      ${exportScript}
      getList();
    </script>
    `;
  

  return script;
};
const indexQueryTemplate = (columns) => {
  let html = ``;
  let dictType, AttrName, parentheseIndex, comment;
  columns.forEach((item) => {
    if (item.isQuery) {
      dictType = item.dictType;
      AttrName = item.javaField.substring(0, 1).toUpperCase() + item.javaField.substring(1);
      parentheseIndex = item.columnComment.indexOf('（');
      if (parentheseIndex != -1) {
        comment = item.columnComment.substring(0, parentheseIndex);
      } else {
        comment = item.columnComment;
      }

      if (item.htmlType == 'input') {
        html += `
                <el-form-item label="${comment}" prop="${item.javaField}">
                <el-input
                  v-model="queryParams.${item.javaField}"
                  placeholder="请输入${comment}"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
                `;
      } else if (item.htmlType == 'select' || (item.htmlType == 'radio' && dictType != '')) {
        html += `
                <el-form-item label="${comment}" prop="${item.javaField}">
                    <el-select v-model="queryParams.${item.javaField}" placeholder="请选择${comment}" clearable>
                    <el-option
                        v-for="dict in ${dictType}"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    />
                    </el-select>
                </el-form-item>
                `;
      } else if ((item.htmlType == 'select' || item.htmlType == 'radio') && dictType == '') {
        html += `
                <el-form-item label="${comment}" prop="${item.javaField}">
                    <el-select v-model="queryParams.${item.javaField}" placeholder="请选择${comment}" clearable>
                    <el-option label="请选择字典生成" value="" />
                    </el-select>
                </el-form-item>
                `;
      } else if (item.htmlType == 'datetime' && item.queryType != 'BETWEEN') {
        html += `
                <el-form-item label="${comment}" prop="${item.javaField}">
                    <el-date-picker clearable
                    v-model="queryParams.${item.javaField}"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择${comment}">
                    </el-date-picker>
                </el-form-item>
                `;
      } else if (item.htmlType == 'datetime' && item.queryType == 'BETWEEN') {
        html += `
                <el-form-item label="${comment}" style="width: 308px">
                    <el-date-picker
                    v-model="daterange${AttrName}"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    ></el-date-picker>
                </el-form-item>
                `;
      }
    }
  });
  html += `
    <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
    </el-form-item>
    `;
  return html;
};
const indexButtomTemplate = (moduleName, businessName) => {
  return `
    <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['${moduleName}:${businessName}:add']"
        >新增</el-button>
        </el-col>
        <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['${moduleName}:${businessName}:edit']"
        >修改</el-button>
        </el-col>
        <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['${moduleName}:${businessName}:remove']"
        >删除</el-button>
        </el-col>
        <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['${moduleName}:${businessName}:export']"
        >导出</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    `;
};
const indexTableTemplate = (columns, businessName, moduleName) => {
  let javaField, parentheseIndex, comment;
  let html = '';
  columns.forEach((item) => {
    javaField = item.javaField;
    parentheseIndex = item.columnComment.indexOf('（');
    if (parentheseIndex != -1) {
      comment = item.columnComment.substring(0, parentheseIndex);
    } else {
      comment = item.columnComment;
    }
    if (item.isPk) {
      html += `<el-table-column label="${comment}" align="center" prop="${javaField}" />
            `;
    } else if (item.isList == '1' && item.htmlType == 'datetime') {
      html += `<el-table-column label="${comment}" align="center" prop="${javaField}" width="180">
                <template v-solt="{row}">
                <span>{{ parseTime(row.${javaField}, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            `;
    } else if (item.list == '1' && item.htmlType == 'imageUpload') {
      html += `<el-table-column label="${comment}" align="center" prop="${javaField}" width="100">
                <template v-slot="{ row }">
                <image-preview :src="row.${javaField}" :width="50" :height="50"/>
                </template>
            </el-table-column>
            `;
    } else if (item.list == '1' && item.dictType != '') {
      html += `<el-table-column label="${comment}" align="center" prop="${javaField}">
                <template v-slot="{ row }">
            `;
      if (item.htmlType == 'checkbox') {
        html += `<dict-tag :options="${item.dictType}" :value="row.${javaField} ? row.${javaField}.split(',') : []"/>
                `;
      } else {
        html += `<dict-tag :options="${item.dictType}" :value="row.${javaField}"/>
                `;
      }
      html += `</template>
                </el-table-column>
            `;
    } else if (item.isList == '1' && javaField != '') {
      html += `<el-table-column label="${comment}" align="center" prop="${javaField}" />
            `;
    }
  });
  html += `<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template v-slot="{row}">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['${moduleName}:${businessName}:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(row)" v-hasPermi="['${moduleName}:${businessName}:remove']">删除</el-button>
            </template>
        </el-table-column>
        `;
  return html;
};

export const indexScriptDicts = (columns) => {
  let script = '';
  let dicts = [];
  columns.forEach((item) => {
    if (item.dictType != '') {
      dicts.push(item.dictType);
    }
  });
  if (dicts.length > 0) {
    script += `
    const { ${dicts.toString()} } = proxy.useDict(${"'" + dicts.join("','") + "'"});
    
    `;
  } else {
    script += ``;
  }
  return script;
};
const handlerExport = (moduleName,businessName)=>{
    let h = ''
    h+= `const  handleExport = () =>{`
    h+=` proxy.download('${moduleName}/${businessName}/export', {`
    h+=`...queryParams.value`
    h+='}, `${businessName}_${new Date().getTime()}.xlsx`)}'

    return h
}