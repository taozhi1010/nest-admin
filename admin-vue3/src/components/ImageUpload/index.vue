<template>
  <div class="component-upload-image">
    <el-upload ref="imageUpload" :action="uploadImgUrl" :before-remove="handleDelete" :before-upload="handleBeforeUpload" :class="{ hide: fileList.length >= limit }" :file-list="fileList" :headers="headers" :limit="limit" list-type="picture-card" multiple :on-error="handleUploadError" :on-exceed="handleExceed" :on-preview="handlePictureCardPreview" :on-success="handleUploadSuccess" :show-file-list="true">
      <el-icon class="avatar-uploader-icon"><plus /></el-icon>
    </el-upload>
    <!-- 上传提示 -->
    <div v-if="showTip" class="el-upload__tip">
      请上传
      <template v-if="fileSize">
        大小不超过
        <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为
        <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      的文件
    </div>

    <el-dialog v-model="dialogVisible" append-to-body title="预览" width="800px">
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from '@/utils/auth'
import { getImageUrl } from '@/utils/image'

const props = defineProps({
  modelValue: [String, Object, Array],
  // 图片数量限制
  limit: {
    type: Number,
    default: 5
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 5
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ['png', 'jpg', 'jpeg']
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true
  }
})

const imageUpload = ref(null)
const emit = defineEmits(['update:modelValue'])
const number = ref(0)
const uploadList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const baseUrl = import.meta.env.VITE_APP_ENV === 'development' ? '' : import.meta.env.VITE_APP_BASE_API
const uploadImgUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/common/upload`) // 上传的图片服务器地址
const headers = ref({ Authorization: `Bearer ${getToken()}` })
const fileList = ref([])
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize))
let loadingInstance = null

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      // 首先将值转为数组
      const list = Array.isArray(val) ? val : props.modelValue.split(',')
      // 然后将数组转为对象数组
      fileList.value = list.map((item) => {
        if (typeof item === 'string') {
          // 使用统一的图片工具方法处理 URL
          const imageUrl = getImageUrl(item)
          item = { name: item, url: imageUrl }
        }
        return item
      })
    } else {
      fileList.value = []
      return []
    }
  },
  { deep: true, immediate: true }
)

// 上传前loading加载
function handleBeforeUpload(file) {
  let isImg = false
  if (props.fileType.length) {
    let fileExtension = ''
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
    }
    isImg = props.fileType.some((type) => {
      if (file.type.indexOf(type) > -1) return true
      if (fileExtension && fileExtension.indexOf(type) > -1) return true
      return false
    })
  } else {
    isImg = file.type.indexOf('image') > -1
  }
  if (!isImg) {
    ElMessage.error(`文件格式不正确, 请上传${props.fileType.join('/')}图片格式文件!`)
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      ElMessage.error(`上传头像图片大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  loadingInstance = ElLoading.service({
    lock: true,
    text: '正在上传图片，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  number.value++
}

// 文件个数超出
function handleExceed() {
  ElMessage.error(`上传文件数量不能超过 ${props.limit} 个!`)
}

// 上传成功回调
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.fileName })
    uploadedSuccessfully()
  } else {
    number.value--
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    ElMessage.error(res.msg)
    if (imageUpload.value) {
      imageUpload.value.handleRemove(file)
    }
    uploadedSuccessfully()
  }
}

// 删除图片
function handleDelete(file) {
  const findex = fileList.value.map((f) => f.name).indexOf(file.name)
  if (findex > -1 && uploadList.value.length === number.value) {
    fileList.value.splice(findex, 1)
    emit('update:modelValue', listToString(fileList.value))
    return false
  }
}

// 上传结束处理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value)
    uploadList.value = []
    number.value = 0
    emit('update:modelValue', listToString(fileList.value))
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  }
}

// 上传失败
function handleUploadError() {
  ElMessage.error('上传图片失败')
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

// 预览
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  let strs = ''
  separator = separator || ','
  for (let i in list) {
    if (undefined !== list[i].url && list[i].url.indexOf('blob:') !== 0) {
      strs += list[i].url.replace(baseUrl, '') + separator
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : ''
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep(.hide .el-upload--picture-card) {
  display: none;
}
</style>
