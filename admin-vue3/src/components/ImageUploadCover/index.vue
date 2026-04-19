<!--
/**
 * 封面裁切上传组件
 * @description 支持图片上传、在线裁切、WebP 压缩等功能的封面图片上传组件
 * @features
 * - 支持图片格式验证和大小限制
 * - 提供在线裁切功能，裁切框比例与预览框保持一致
 * - 自动将图片转换为 WebP 格式，减少文件体积
 * - 支持实时预览裁切效果
 * - 支持预览、更换、删除等操作
 * - 可选裁切模式，支持跳过裁切直接上传
 *
 * @example
 * // 基础使用（启用裁切）
 * <ImageUploadCover v-model="coverUrl" />
 *
 * // 自定义尺寸
 * <ImageUploadCover
 *   v-model="coverUrl"
 *   :max-size="10"
 *   width="400px"
 *   preview-width="400"
 * />
 *
 * // 禁用裁切功能
 * <ImageUploadCover v-model="coverUrl" :enable-crop="false" />
 */
-->
<template>
    <div class="upload-cover-container">
        <el-upload ref="uploadRef" :action="uploadUrl" :before-upload="handleBeforeUpload" :http-request="customUpload"
            :show-file-list="false" accept="image/*" class="cover-uploader">
            <!-- 预览区域 -->
            <div v-if="imageUrl" class="cover-preview">
                <img :src="imageUrl" class="cover-image" alt="封面" />
                <div class="cover-actions" @click.stop>
                    <div class="action-item" @click="handlePreview">
                        <el-icon><ZoomIn /></el-icon>
                        <span>预览</span>
                    </div>
                    <div class="action-item" @click="handleReupload">
                        <el-icon><Refresh /></el-icon>
                        <span>更换</span>
                    </div>
                    <div v-if="showDeleteBtn" class="action-item" @click="handleRemove">
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                    </div>
                </div>
            </div>

            <!-- 上传占位符 -->
            <div v-else class="cover-placeholder">
                <el-icon class="placeholder-icon">
                    <Plus />
                </el-icon>
                <span class="placeholder-text">{{ uploadText }}</span>
                <span v-if="sizeTip" class="placeholder-tip">{{ sizeTip }}</span>
            </div>
        </el-upload>

        <!-- 预览对话框 -->
        <el-dialog v-model="previewVisible" append-to-body title="封面预览" width="900px">
            <img :src="imageUrl" class="preview-full" alt="预览" />
        </el-dialog>

        <!-- 裁切对话框 -->
        <el-dialog v-model="cropDialogVisible" append-to-body title="裁切封面" width="900px" @close="closeCropDialog">
            <el-row :gutter="20">
                <el-col :span="12">
                    <div class="cropper-wrapper">
                        <VueCropper
                            v-if="cropDialogVisible"
                            ref="cropperRef"
                            :img="cropImageSource"
                            :auto-crop="true"
                            :fixed="true"
                            :fixed-number="fixedNumber"
                            :full="true"
                            :center-box="true"
                            :info="true"
                            :output-type="'png'"
                            :can-move="true"
                            :original="true"
                            :auto-crop-width="200"
                            :auto-crop-height="200"
                            :max-img-size="3000"
                            :can-scale="true"
                            @real-time="handleRealTime"
                            style="width: 100%; height: 100%;"
                        />
                    </div>
                </el-col>
                <el-col :span="12">
                    <div class="crop-preview-container">
                        <div class="crop-preview-box" :style="{
                            width: previewWidth + 'px',
                            height: computedPreviewHeight + 'px'
                        }">
                            <img v-if="cropPreviews.url" :src="cropPreviews.url" :style="cropPreviews.img" alt="裁切预览" />
                        </div>
                        <p class="preview-tip">实时预览</p>
                    </div>
                </el-col>
            </el-row>
            <template #footer>
                <div class="crop-dialog-footer">
                    <div class="footer-left">
                        <el-button icon="Plus" @click="changeScale(1)" title="放大" circle />
                        <el-button icon="Minus" @click="changeScale(-1)" title="缩小" circle />
                        <el-button icon="RefreshLeft" @click="rotateLeft" title="向左旋转" circle />
                        <el-button icon="RefreshRight" @click="rotateRight" title="向右旋转" circle />
                    </div>
                    <div class="footer-right">
                        <el-button @click="closeCropDialog">取 消</el-button>
                        <el-button type="info" @click="skipCropAndUpload">跳过裁切</el-button>
                        <el-button type="primary" @click="submitCrop">确 定</el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { getToken } from '@/utils/auth'
import { Plus, ZoomIn, Delete, Refresh } from '@element-plus/icons-vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    // 最大文件大小(MB)
    maxSize: {
        type: Number,
        default: 5
    },
    // 图片质量(0-1)
    quality: {
        type: Number,
        default: 0.85
    },
    // 上传路径参数
    path: {
        type: String,
        default: ''
    },
    // 建议尺寸提示
    sizeTip: {
        type: String,
        default: '建议尺寸 800x450'
    },
    // 上传提示文字
    uploadText: {
        type: String,
        default: '上传封面'
    },
    // 是否显示删除按钮
    showDeleteBtn: {
        type: Boolean,
        default: true
    },
    // 容器宽度
    width: {
        type: String,
        default: '100%'
    },
    // 容器高度（支持具体值或aspect-ratio）
    height: {
        type: String,
        default: ''
    },
    // 宽高比（如 16/9, 4/3, 1/1）
    aspectRatio: {
        type: String,
        default: '16 / 9'
    },
    // 预览框宽度（像素）
    previewWidth: {
        type: Number,
        default: 300
    },
    // 预览框高度（像素），如果为 0 则根据宽高比自动计算
    previewHeight: {
        type: Number,
        default: 0
    },
    // 预览框宽高比（如 16/9, 4/3, 1/1），仅当 previewHeight 为 0 时生效
    previewRatio: {
        type: String,
        default: '16 / 9'
    },
    // 是否启用裁切功能
    enableCrop: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:modelValue'])

const uploadRef = ref(null)
const imageUrl = ref('')
const previewVisible = ref(false)
const uploadUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/common/upload`)

// 裁切相关数据
const cropDialogVisible = ref(false)
const cropImageSource = ref('')
const cropperRef = ref(null)
const cropPreviews = ref({})
const currentUploadFile = ref(null) // 保存当前待上传的文件

// 计算裁切框的固定宽高比（与预览框一致）
const fixedNumber = computed(() => {
    const ratio = props.previewRatio.split('/')
    const ratioValue = parseFloat(ratio[0]) / parseFloat(ratio[1])
    return [parseFloat(ratio[0]), parseFloat(ratio[1])]
})

// 计算预览框高度
const computedPreviewHeight = computed(() => {
    if (props.previewHeight > 0) {
        return props.previewHeight
    }
    // 根据预览宽高比计算高度
    const ratio = props.previewRatio.split('/')
    const ratioValue = parseFloat(ratio[0]) / parseFloat(ratio[1])
    return Math.round(props.previewWidth / ratioValue)
})

// 监听modelValue变化
watch(
    () => props.modelValue,
    (val) => {
        if (val) {
            imageUrl.value = val.startsWith('http') || val.startsWith('/')
                ? val
                : `${import.meta.env.VITE_APP_BASE_API}${val}`
        } else {
            imageUrl.value = ''
        }
    },
    { immediate: true }
)

/**
 * 将图片转换为WebP格式
 * @param {File} file - 原始图片文件
 * @param {Number} quality - WebP质量(0-1)
 * @returns {Promise<Blob>} - WebP格式的Blob
 */
function convertToWebP(file, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('WebP转换失败'))
                        }
                    },
                    'image/webp',
                    quality
                )
            }

            img.onerror = () => {
                reject(new Error('图片加载失败'))
            }

            img.src = e.target.result
        }

        reader.onerror = () => {
            reject(new Error('文件读取失败'))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * 上传前验证
 */
function handleBeforeUpload(file) {
    // 验证文件类型
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
    }

    // 验证文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
    if (!isLtMaxSize) {
        ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`)
        return false
    }

    // 如果启用了裁切功能，打开裁切对话框
    if (props.enableCrop) {
        openCropDialog(file)
    } else {
        // 否则直接上传
        customUpload({ file })
    }
    
    // 阻止默认上传行为
    return false
}

/**
 * 自定义上传逻辑
 */
async function customUpload(options) {
    const { file } = options
    let uploadFile = file

    try {
        // 显示加载提示
        const loading = ElLoading.service({
            lock: true,
            text: '正在处理图片...',
            background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
            // 转换为WebP格式
            const webpBlob = await convertToWebP(file, props.quality)

            // 计算压缩率
            const originalSize = (file.size / 1024).toFixed(2)
            const compressedSize = (webpBlob.size / 1024).toFixed(2)
            const compressionRate = ((1 - webpBlob.size / file.size) * 100).toFixed(1)

            console.log(`图片压缩: ${originalSize}KB → ${compressedSize}KB (减少${compressionRate}%)`)

            // 创建新的File对象
            uploadFile = new File([webpBlob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp'
            })
        } catch (error) {
            console.error('WebP转换失败，使用原图上传:', error)
            ElMessage.warning('WebP转换失败，将使用原图上传')
        }

        // 构建FormData
        const formData = new FormData()
        formData.append('file', uploadFile)
        
        // 添加路径参数
        if (props.path) {
            formData.append('path', props.path)
        }

        // 发送请求
        const response = await fetch(uploadUrl.value, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        })

        const res = await response.json()
        loading.close()

        if (res.code === 200) {
            const data = res.data
            // 优先使用后端返回的 url 字段，如果没有则拼接 fileName
            const previewUrl = data.url || (data.fileName.startsWith('http') || data.fileName.startsWith('/')
                ? data.fileName
                : `${import.meta.env.VITE_APP_BASE_API}${data.fileName}`)

            // 更新预览URL
            imageUrl.value = previewUrl

            // 触发v-model更新（通常保存 fileName 或 url）
            emit('update:modelValue', data.url || data.fileName)
            ElMessage.success('上传成功')
        } else {
            ElMessage.error(res.msg || '上传失败')
        }
    } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('上传失败，请重试')
    }
}

/**
 * 重新上传
 */
function handleReupload() {
    if (uploadRef.value) {
        uploadRef.value.$el.querySelector('input').click()
    }
}

/**
 * 删除封面
 */
function handleRemove() {
    imageUrl.value = ''
    emit('update:modelValue', '')
    ElMessage.success('已删除封面')
}

/**
 * 预览封面
 */
function handlePreview() {
    if (imageUrl.value) {
        previewVisible.value = true
    }
}

/**
 * 打开裁切对话框
 */
function openCropDialog(file) {
    currentUploadFile.value = file // 保存文件引用
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
        cropImageSource.value = reader.result
        cropDialogVisible.value = true
    }
    reader.onerror = () => {
        ElMessage.error('图片读取失败')
    }
}

/**
 * 关闭裁切对话框
 */
function closeCropDialog() {
    cropDialogVisible.value = false
    cropImageSource.value = ''
    cropPreviews.value = {}
    currentUploadFile.value = null
}

/**
 * 图片缩放
 */
function changeScale(num) {
    num = num || 1
    cropperRef.value?.changeScale(num)
}

/**
 * 向左旋转
 */
function rotateLeft() {
    cropperRef.value?.rotateLeft()
}

/**
 * 向右旋转
 */
function rotateRight() {
    cropperRef.value?.rotateRight()
}

/**
 * 实时预览
 */
function handleRealTime(data) {
    console.log('实时预览数据:', data)
    cropPreviews.value = data
}

/**
 * 跳过裁切直接上传
 */
async function skipCropAndUpload() {
    if (!currentUploadFile.value) {
        ElMessage.error('没有可上传的文件')
        return
    }
    
    // 关闭裁切对话框
    closeCropDialog()
    
    // 直接上传原图
    await customUpload({ file: currentUploadFile.value })
}

/**
 * 提交裁切并上传
 */
async function submitCrop() {
    return new Promise((resolve, reject) => {
        cropperRef.value?.getCropBlob(async (blob) => {
            if (!blob) {
                ElMessage.error('裁切图片失败')
                reject(new Error('裁切失败'))
                return
            }

            try {
                // 显示加载提示
                const loading = ElLoading.service({
                    lock: true,
                    text: '正在处理图片...',
                    background: 'rgba(0, 0, 0, 0.7)'
                })

                try {
                    // 将裁切后的 Blob 转换为 File
                    const croppedFile = new File([blob], 'cover.png', { type: blob.type })

                    // 转换为 WebP 格式
                    const webpBlob = await convertToWebP(croppedFile, props.quality)

                    // 计算压缩率
                    const originalSize = (croppedFile.size / 1024).toFixed(2)
                    const compressedSize = (webpBlob.size / 1024).toFixed(2)
                    const compressionRate = ((1 - webpBlob.size / croppedFile.size) * 100).toFixed(1)

                    console.log(`图片压缩: ${originalSize}KB → ${compressedSize}KB (减少${compressionRate}%)`)

                    // 创建新的 File 对象
                    const uploadFile = new File([webpBlob], 'cover.webp', {
                        type: 'image/webp'
                    })

                    // 构建 FormData
                    const formData = new FormData()
                    formData.append('file', uploadFile)
                    
                    // 添加路径参数
                    if (props.path) {
                        formData.append('path', props.path)
                    }

                    // 发送请求
                    const response = await fetch(uploadUrl.value, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: formData
                    })

                    const res = await response.json()
                    loading.close()

                    if (res.code === 200) {
                        const data = res.data
                        // 优先使用后端返回的 url 字段，如果没有则拼接 fileName
                        const previewUrl = data.url || (data.fileName.startsWith('http') || data.fileName.startsWith('/')
                            ? data.fileName
                            : `${import.meta.env.VITE_APP_BASE_API}${data.fileName}`)

                        // 更新预览 URL
                        imageUrl.value = previewUrl

                        // 触发 v-model 更新
                        emit('update:modelValue', data.url || data.fileName)
                        
                        // 关闭对话框
                        closeCropDialog()
                        
                        ElMessage.success('上传成功')
                        resolve(res)
                    } else {
                        ElMessage.error(res.msg || '上传失败')
                        reject(new Error(res.msg || '上传失败'))
                    }
                } catch (error) {
                    loading.close()
                    console.error('WebP 转换或上传失败:', error)
                    ElMessage.error('图片处理失败，请重试')
                    reject(error)
                }
            } catch (error) {
                console.error('裁切处理失败:', error)
                ElMessage.error('处理失败，请重试')
                reject(error)
            }
        })
    })
}
</script>

<style scoped lang="scss">
.upload-cover-container {
    width: 100%;
}

.cover-uploader {
    :deep(.el-upload) {
        border: 2px dashed var(--el-border-color);
        border-radius: 8px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;
        width: v-bind(width);
        aspect-ratio: v-bind(aspectRatio);

        &:hover {
            border-color: var(--el-color-primary);
        }
    }
}

.cover-preview {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 6px;
    overflow: hidden;

    .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .cover-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        opacity: 0;
        transition: opacity 0.3s;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;

        .action-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 10px 16px;
            border-radius: 8px;
            transition: all 0.3s;

            .el-icon {
                font-size: 24px;
            }

            span {
                font-size: 14px;
            }

            &:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            &:nth-child(3):hover {
                color: #f56c6c;
            }
        }
    }

    &:hover .cover-actions {
        opacity: 1;
    }
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-lighter);

    .placeholder-icon {
        font-size: 40px;
        color: var(--el-color-primary);
        margin-bottom: 12px;
    }

    .placeholder-text {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 4px;
    }

    .placeholder-tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
    }
}

.preview-full {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
    display: block;
    margin: 0 auto;
}

// 裁切预览区域样式
.crop-preview-container {
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .crop-preview-box {
        border: 2px dashed var(--el-border-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--el-fill-color-lighter);
        position: relative;
        transition: all 0.3s;

        img {
            position: absolute;
            top: 0;
            left: 0;
        }
    }

    .preview-tip {
        margin-top: 12px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
    }
}

// 裁切器包裹层
.cropper-wrapper {
    width: 100%;
    height: 400px;
    border: 2px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
    // 添加棋盘格背景，模拟遮罩效果
    background-image: 
        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

// 裁切对话框底部样式
.crop-dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .footer-left {
        display: flex;
        gap: 10px;
    }

    .footer-right {
        display: flex;
        gap: 10px;
    }
}
</style>
