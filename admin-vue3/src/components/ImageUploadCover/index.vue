<template>
    <div class="upload-cover-container">
        <el-upload ref="uploadRef" :action="uploadUrl" :before-upload="handleBeforeUpload" :http-request="customUpload"
            :show-file-list="false" accept="image/*" class="cover-uploader">
            <!-- 预览区域 -->
            <div v-if="imageUrl" class="cover-preview">
                <img :src="imageUrl" class="cover-image" alt="封面" />
                <div class="cover-overlay">
                    <el-icon class="overlay-icon">
                        <ZoomIn />
                    </el-icon>
                    <span class="overlay-text">点击更换</span>
                </div>
                <div class="cover-actions">
                    <el-button circle size="small" type="danger" @click.stop="handleRemove">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </div>

            <!-- 上传占位符 -->
            <div v-else class="cover-placeholder">
                <el-icon class="placeholder-icon">
                    <Plus />
                </el-icon>
                <span class="placeholder-text">上传封面</span>
                <span class="placeholder-tip">建议尺寸 800x450</span>
            </div>
        </el-upload>

        <!-- 预览对话框 -->
        <el-dialog v-model="previewVisible" append-to-body title="封面预览" width="900px">
            <img :src="imageUrl" class="preview-full" alt="预览" />
        </el-dialog>
    </div>
</template>

<script setup>
import { getToken } from '@/utils/auth'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'

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
    }
})

const emit = defineEmits(['update:modelValue'])

const uploadRef = ref(null)
const imageUrl = ref('')
const previewVisible = ref(false)
const uploadUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/common/upload`)

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

    return true
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
        width: 100%;
        aspect-ratio: 16 / 9;

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

    .cover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        color: #fff;

        .overlay-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .overlay-text {
            font-size: 14px;
        }
    }

    &:hover .cover-overlay {
        opacity: 1;
    }

    .cover-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.3s;
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
</style>
