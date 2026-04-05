<template>
  <div class="user-info-head" @click="openDialog()">
    <img class="img-circle img-lg" :src="imgSource" title="点击上传头像" />
    <el-dialog v-model="dialogVisible" append-to-body title="修改头像" width="800px" @close="closeDialog" @opened="onDialogOpened">
      <el-row>
        <el-col :md="12" :style="{ height: '350px' }" :xs="24">
          <vue-cropper v-if="cropperVisible" ref="cropperRef" :auto-crop="true" :auto-crop-height="200" :auto-crop-width="200" :fixed-box="true" :img="imgSource" :info="true" :output-type="'png'" @real-time="handleRealTime" />
        </el-col>
        <el-col :md="12" :style="{ height: '350px' }" :xs="24">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :before-upload="handleFileSelect" :show-file-list="false">
            <el-button>
              选择
              <el-icon class="el-icon--right">
                <upload />
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="submitCrop()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
// ==================== 导入区域 ====================
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/system/user'
import useUserStore from '@/store/modules/user'
import { watch } from 'vue'
import { getImageUrl } from '@/utils/image'
import defAva from '@/assets/images/profile.jpg'

// ==================== Props ====================
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})

// ==================== Emits ====================
const emit = defineEmits(['updateAvatar'])

// ==================== 实例和字典 ====================
const userStore = useUserStore()

// ==================== 表单引用 ====================
const cropperRef = ref(null)

// ==================== 响应式数据 ====================
const dialogVisible = ref(false)
const cropperVisible = ref(false)
const imgSource = ref('')
const previews = ref({})

// ==================== 监听 Props 变化 ====================
// 监听 user prop 变化，更新头像显示
watch(() => props.user?.avatar, (newAvatar) => {
  // 如果头像为空，使用默认头像；否则使用 getImageUrl 处理
  const imgUrl = newAvatar ? getImageUrl(newAvatar) : defAva
  imgSource.value = imgUrl
  // 同时更新 store，保持一致
  userStore.avatar = imgUrl
}, { immediate: true })

// ==================== 方法定义 ====================

// 打开裁剪弹窗
const openDialog = () => {
  dialogVisible.value = true
}

// 弹窗打开完成后的回调
const onDialogOpened = () => {
  cropperVisible.value = true
}

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false
  cropperVisible.value = false
  // 恢复原始图片
  imgSource.value = userStore.avatar
}

// 选择图片文件
const handleFileSelect = (file) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('文件格式错误，请上传图片类型，如：JPG，PNG 后缀的文件。')
    return false
  }
  
  // 验证文件大小（2MB 以内）
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    ElMessage.error('头像图片大小不能超过 2MB！')
    return false
  }
  
  // 读取文件并显示
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    imgSource.value = reader.result
  }
  return false // 阻止默认上传行为
}

// 图片缩放
const changeScale = (num) => {
  num = num || 1
  cropperRef.value?.changeScale(num)
}

// 向左旋转
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value?.rotateRight()
}

// 实时预览
const handleRealTime = (data) => {
  previews.value = data
}

// 提交裁剪的图片
const submitCrop = async () => {
  return new Promise((resolve, reject) => {
    cropperRef.value?.getCropBlob((blob) => {
      if (!blob) {
        ElMessage.error('裁剪图片失败')
        reject(new Error('裁剪失败'))
        return
      }
      
      // 创建 FormData
      const formData = new FormData()
      formData.append('avatarfile', blob)
      
      // 上传到服务器
      uploadAvatar(formData)
        .then((response) => {
          // 后端返回的 data 就是完整的用户对象，包含 avatar 字段
          const avatarPath = response.data.avatar || response.data.imgUrl
          
          // 获取完整的图片 URL（使用统一工具方法）
          const imgUrl = getImageUrl(avatarPath)
          
          // 1. 先通知父组件更新（这样外部头像会立即刷新）
          emit('updateAvatar', avatarPath)
          
          // 2. 更新 Pinia Store
          userStore.avatar = imgUrl
          
          // 3. 更新本地显示
          imgSource.value = imgUrl
          
          // 4. 关闭弹窗
          closeDialog()
          
          // 5. 显示成功提示
          ElMessage.success('修改成功')
          resolve(response)
        })
        .catch((error) => {
          console.error('上传头像失败:', error)
          ElMessage.error('上传头像失败，请重试')
          reject(error)
        })
    })
  })
}
</script>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>
