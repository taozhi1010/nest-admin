<template>
  <div class="user-info-head" @click="userAvatar.editCropper()">
    <img class="img-circle img-lg" :src="userAvatar.options.img" title="点击上传头像" />
    <el-dialog v-model="userAvatar.open" append-to-body :title="userAvatar.title" width="800px" @close="userAvatar.closeDialog" @opened="userAvatar.modalOpened">
      <el-row>
        <el-col :md="12" :style="{ height: '350px' }" :xs="24">
          <vue-cropper v-if="userAvatar.visible" ref="cropperRef" :auto-crop="userAvatar.options.autoCrop" :auto-crop-height="userAvatar.options.autoCropHeight" :auto-crop-width="userAvatar.options.autoCropWidth" :fixed-box="userAvatar.options.fixedBox" :img="userAvatar.options.img" :info="true" :output-type="userAvatar.options.outputType" @real-time="userAvatar.realTime" />
        </el-col>
        <el-col :md="12" :style="{ height: '350px' }" :xs="24">
          <div class="avatar-upload-preview">
            <img :src="userAvatar.options.previews.url" :style="userAvatar.options.previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :before-upload="beforeUpload" :http-request="requestUpload" :show-file-list="false">
            <el-button>
              选择
              <el-icon class="el-icon--right">
                <upload />
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="userAvatar.changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="userAvatar.changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="userAvatar.rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="userAvatar.rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="userAvatar.uploadImg()">提 交</el-button>
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
const { proxy } = getCurrentInstance()

// ==================== 表单引用 ====================
const cropperRef = ref(null)

// ==================== 头像管理（集中式管理） ====================
const userAvatar = reactive({
  // 响应式数据
  open: false,
  visible: false,
  title: '修改头像',

  // 图片裁剪数据
  options: {
    img: userStore.avatar, // 裁剪图片的地址
    autoCrop: true, // 是否默认生成截图框
    autoCropWidth: 200, // 默认生成截图框宽度
    autoCropHeight: 200, // 默认生成截图框高度
    fixedBox: true, // 固定截图框大小 不允许改变
    outputType: 'png', // 默认生成截图为 PNG 格式
    previews: {} //预览数据
  },

  // 方法集合
  // 编辑头像
  editCropper: () => {
    userAvatar.open = true
  },

  // 打开弹出层结束时的回调
  modalOpened: () => {
    userAvatar.visible = true
  },

  // 覆盖默认上传行为
  requestUpload: () => {},

  // 向左旋转
  rotateLeft: () => {
    proxy.$refs.cropperRef.rotateLeft()
  },

  // 向右旋转
  rotateRight: () => {
    proxy.$refs.cropperRef.rotateRight()
  },

  // 图片缩放
  changeScale: (num) => {
    num = num || 1
    proxy.$refs.cropperRef.changeScale(num)
  },

  // 上传预处理
  beforeUpload: (file) => {
    if (file.type.indexOf('image/') == -1) {
      proxy.$modal.msgError('文件格式错误，请上传图片类型，如：JPG，PNG 后缀的文件。')
    } else {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        userAvatar.options.img = reader.result
      }
    }
  },

  // 上传图片
  uploadImg: async () => {
    try {
      proxy.$refs.cropperRef.getCropBlob(async (data) => {
        let formData = new FormData()
        formData.append('avatarfile', data)
        const response = await uploadAvatar(formData)
        userAvatar.open = false
        userAvatar.options.img = import.meta.env.VITE_APP_BASE_API + response.data.imgUrl
        userStore.avatar = userAvatar.options.img
        emit('updateAvatar', response.data.imgUrl)
        proxy.$modal.msgSuccess('修改成功')
        userAvatar.visible = false
      })
    } catch (e) {
      console.error('上传头像失败:', e)
    }
  },

  // 实时预览
  realTime: (data) => {
    userAvatar.options.previews = data
  },

  // 关闭窗口
  closeDialog: () => {
    userAvatar.options.img = userStore.avatar
    userAvatar.visible = false
  }
})
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
