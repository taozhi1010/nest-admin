import { indexScriptDicts } from './indexVue.vue';

export const dialogVue = (options) => {
  const html = generateTemplate(options);
  const script = generateScriptSetup(options);
  return `
    ${html}
    ${script}
  `;
};

const generateTemplate = ({ columns }) => {
  let html = '';
  columns.forEach((item) => {
    if (item.isInsert === '1' && item.isPk === '0') {
      const comment = item.columnComment.split('(')[0];
      const field = item.javaField;
      const dictType = item.dictType;
      const htmlType = item.htmlType;

      const htmlMap = {
        input: `
          <el-form-item label="${comment}" prop="${field}">
            <el-input v-model="form.${field}" placeholder="请输入${comment}" />
          </el-form-item>
        `,
        imageUpload: `
          <el-form-item label="${comment}" prop="${field}">
            <image-upload v-model="form.${field}"/>
          </el-form-item>
        `,
        fileUpload: `
          <el-form-item label="${comment}" prop="${field}">
            <file-upload v-model="form.${field}"/>
          </el-form-item>
        `,
        editor: `
          <el-form-item label="${comment}">
            <editor v-model="form.${field}" :min-height="192"/>
          </el-form-item>
        `,
        select: dictType ? `
          <el-form-item label="${comment}" prop="${field}">
            <el-select v-model="form.${field}" placeholder="请选择${comment}">
              <el-option v-for="dict in ${dictType}" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        ` : `
          <el-form-item label="${comment}" prop="${field}">
            <el-select v-model="form.${field}" placeholder="请选择${comment}">
              <el-option label="请选择字典生成" value="" />
            </el-select>
          </el-form-item>
        `,
        checkbox: dictType ? `
          <el-form-item label="${comment}" prop="${field}">
            <el-checkbox-group v-model="form.${field}">
              <el-checkbox v-for="dict in ${dictType}" :key="dict.value" :label="dict.value">{{dict.label}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        ` : `
          <el-form-item label="${comment}" prop="${field}">
            <el-checkbox-group v-model="form.${field}">
              <el-checkbox>请选择字典生成</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        `,
        radio: dictType ? `
          <el-form-item label="${comment}" prop="${field}">
            <el-radio-group v-model="form.${field}">
              <el-radio v-for="dict in ${dictType}" :key="dict.value" :value="dict.value">{{dict.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
        ` : `
          <el-form-item label="${comment}" prop="${field}">
            <el-radio-group v-model="form.${field}">
              <el-radio label="1">请选择字典生成</el-radio>
            </el-radio-group>
          </el-form-item>
        `,
        datetime: `
          <el-form-item label="${comment}" prop="${field}">
            <el-date-picker clearable v-model="form.${field}" type="date" value-format="YYYY-MM-DD" placeholder="请选择${comment}"></el-date-picker>
          </el-form-item>
        `,
        textarea: `
          <el-form-item label="${comment}" prop="${field}">
            <el-input v-model="form.${field}" type="textarea" placeholder="请输入内容" />
          </el-form-item>
        `
      };

      html += htmlMap[htmlType] || '';
    }
  });

  return `
    <template>
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500">
        <el-form :model="form" label-width="auto" style="max-width: 600px" ref="formRef" :rules="rules">
          ${html}
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancel" class="defauleButton">取消</el-button>
            <el-button type="primary" @click="confirm"> 确定 </el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  `;
};

const generateScriptSetup = ({ columns, BusinessName, moduleName, businessName, primaryKey, functionName }) => {
  const dicts = indexScriptDicts(columns);
  const form = generateFormData(columns);
  const rules = generateRulesData(columns);

  return `
    <script setup>
    import { add${BusinessName}, update${BusinessName} } from "@/api/${moduleName}/${businessName}";
    import { ref, getCurrentInstance } from "vue";
    const { proxy } = getCurrentInstance();
    ${dicts}
    const dialogVisible = ref(false);
    const dialogTitle = ref("");
    const formRef = ref(null);
    const emit = defineEmits(["update"]);
    const form = ref({ 
      ${form} 
    });
    const rules = ref({ 
      ${rules} 
    });
    const cancel = () => close();
    const confirm = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          const action = form.value.${primaryKey} ? update${BusinessName} : add${BusinessName};
          action(form.value).then(() => {
            proxy.$modal.msgSuccess("操作成功");
            emit("update");
            close();
          });
        }
      });
    };
    const close = () => dialogVisible.value = false;
    const reset = () => {
      form.value = {
        ${form}
      }
      proxy.resetForm("formRef");
    }
    const init = (row) => {
      reset();
      dialogTitle.value = row ? "修改${functionName}" : "新增${functionName}";
      form.value = row ? { ...row } : {};
    };
    const openDialog = (row = null) => {
      dialogVisible.value = true;
      init(row);
    };
    defineExpose({ openDialog });
    </script>
  `;
};

const generateFormData = (columns) => {
  return columns
    .filter(item => item.isInsert === '1' && item.isPk === '0')
    .map(item => `
    ${item.javaField}: ${item.htmlType === 'checkbox' ? '[]' : '""'}`)
    .join(',\n');
};

const generateRulesData = (columns) => {
  return columns
    .filter(item => item.isRequired === '1')
    .map(item => `${item.javaField}: [{ required: true, message: "${item.columnComment}不能为空", trigger: "blur" }]`)
    .join(',\n');
};