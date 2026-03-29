<template>
    <!-- 验证码组件 -->
    <div :class="['captcha-code-container', `captcha-size-${size}`]" @click="handleClick">
        <!-- 加载状态（初始或刷新） -->
        <div v-if="!imgUrl || refreshing" class="loading-overlay">
            <span class="loading-text">加载中...</span>
        </div>
        <!-- 验证码图片 (使用 v-html 避免 base64 解析问题) -->
        <div v-else class="captcha-img" v-html="imgUrl"></div>
    </div>
</template>

<script setup name="CaptchaCode">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    // 验证码图片的 base64 字符串
    imgUrl: {
        type: String,
        default: ''
    },
    // 是否正在刷新
    refreshing: {
        type: Boolean,
        default: false
    },
    // 尺寸：large / default / small
    size: {
        type: String,
        default: 'default',
        validator: (value) => ['large', 'default', 'small'].includes(value)
    }
})

const emit = defineEmits(['refresh'])

// 点击事件
const handleClick = () => {
    emit('refresh')
}
</script>

<style lang="scss" scoped>
.captcha-code-container {
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;

    &:hover {
        border-color: #d0d0d0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}

// 大尺寸
.captcha-size-large {
    height: 40px;
    width: 120px; // 默认宽度
    font-size: 14px;
}

// 默认尺寸
.captcha-size-default {
    height: 32px;
    width: 100px; // 默认宽度
    font-size: 14px;
}

// 小尺寸
.captcha-size-small {
    height: 24px;
    width: 80px; // 默认宽度
    font-size: 12px;
}

// 验证码图片容器
.captcha-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end; // 横向靠右对齐
    padding: 8px; // 内边距
    box-sizing: border-box;

    img {
        height: calc(100% - 16px); // 减去上下内边距
        width: auto; // 宽度自适应
        min-width: 60px; // 最小宽度，避免太窄
        max-width: 120px; // 最大宽度，避免太宽
        object-fit: contain; // 保持比例
        display: block;
        cursor: pointer;
    }
}

// 加载状态遮罩层
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .loading-text {
        color: #409eff;
        font-size: 12px;
        font-weight: 500;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
