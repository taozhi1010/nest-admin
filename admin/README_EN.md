# RuoYi AI Admin

> English Documentation | [中文文档](./README.md)

A modern enterprise-level admin management system built on the Vben Admin framework, featuring comprehensive permission management, system monitoring and other enterprise-grade functional modules.

## ✨ Features

- 🎯 **Modern Architecture**: Built with Vue 3 + TypeScript + Vite
- 🛠️ **Rich Components**: Integrated with Ant Design Vue component library
- 🔐 **Permission Management**: Complete RBAC permission control system
- 📊 **System Monitoring**: Real-time system status monitoring
- 📱 **Responsive Design**: Perfect adaptation to various device screens

## 🚀 Tech Stack

### Frontend Technologies
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Superset of JavaScript
- **Vite** - Next generation frontend build tool
- **Ant Design Vue** - Enterprise-class UI component library
- **Pinia** - Vue state management
- **Vue Router** - Official routing manager

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **Turbo** - High-performance build system
- **ESLint** - Code quality checker
- **Prettier** - Code formatter
- **Husky** - Git hooks tool

## 📋 Requirements

- **Node.js** >= 20.10.0
- **pnpm** >= 9.12.0

## 🛠️ Quick Start

### 1. Clone the project
```bash
git clone https://github.com/ageerle/ruoyi-admin
cd ruoyi-admin
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Start development server
```bash
pnpm run dev:antd
```

### 4. Build for production
```bash
pnpm run build:antd
```

## 📝 Important Notes

1. **Node.js Version**: Please ensure you're using Node.js 20.10.0 or higher
2. **Package Manager**: This project uses pnpm, do not use npm or yarn
3. **Development Environment**: VS Code with relevant plugins is recommended
4. **Browser Support**: Supports modern browsers, IE is not supported

## 📚 Project Structure

```
ruoyi-admin/
├── apps/                    # Applications directory
│   ├── web-antd/           # Ant Design Vue version
├── packages/               # Shared packages
│   ├── @core/             # Core package
│   ├── constants/         # Constants definition
│   ├── effects/           # Side effects handling
│   ├── icons/             # Icon library
│   ├── locales/           # Internationalization
│   ├── preferences/       # Preference settings
│   ├── stores/            # State management
│   ├── styles/            # Style files
│   ├── types/             # Type definitions
│   └── utils/             # Utility functions
├── internal/              # Internal tools
└── scripts/               # Build scripts
```

---

**RuoYi AI Admin - Making enterprise-level backend management simpler and more efficient!**
