#!/usr/bin/env node

/**
 * 使用 Node.js v22 单文件可执行应用程序（SEA）打包脚本
 * 基于 https://nodejs.org/docs/latest-v22.x/api/single-executable-applications.html
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const rootDir = process.cwd();
const distDir =  path.posix.join(rootDir, 'dist_ncc');
const outputDir =  path.posix.join(rootDir, 'sea-output');

console.log('🚀 开始创建单文件可执行应用程序...');

async function createSEA() {
  try {
    // 检查 Node.js 版本
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 22) {
      throw new Error(`需要 Node.js v22 或更高版本，当前版本: ${nodeVersion}`);
    }
    
    console.log(`✅ Node.js 版本检查通过: ${nodeVersion}`);

    // 检查入口文件是否存在
    const entryFile =  path.posix.join(distDir, 'index.js');
    if (!fs.existsSync(entryFile)) {
      throw new Error(`入口文件不存在: ${entryFile}，请先运行 npm run build:ncc`);
    }
    
    console.log('✅ 入口文件检查通过');

    // 创建输出目录
    await fs.ensureDir(outputDir);
    
    // 步骤 1: 生成 blob 文件
    console.log('📦 正在生成 blob 文件...');
    execSync('node --experimental-sea-config sea-config.json', {
      cwd: rootDir,
      stdio: 'inherit'
    });
    
    console.log('✅ blob 文件生成完成');

    // 步骤 2: 复制 Node.js 可执行文件
    console.log('📋 正在复制 Node.js 可执行文件...');
    const nodeExe = process.execPath;
    const platform = os.platform();
    let outputFileName;
    
    switch (platform) {
      case 'win32':
        outputFileName = 'nest-app.exe';
        break;
      case 'darwin':
        outputFileName = 'nest-app';
        break;
      case 'linux':
        outputFileName = 'nest-app';
        break;
      default:
        outputFileName = 'nest-app';
    }
    
    const outputPath =  path.posix.join(outputDir, outputFileName);
    await fs.copy(nodeExe, outputPath);
    
    console.log('✅ Node.js 可执行文件复制完成');

    // 步骤 3: 移除签名（仅在 macOS 上）
    if (platform === 'darwin') {
      console.log('🔓 正在移除 macOS 签名...');
      try {
        execSync(`codesign --remove-signature "${outputPath}"`, { stdio: 'inherit' });
        console.log('✅ macOS 签名移除完成');
      } catch (error) {
        console.warn('⚠️  移除签名失败，但继续执行...');
      }
    }

    // 步骤 4: 注入 blob
    console.log('💉 正在注入 blob 文件...');
    const blobPath =  path.posix.join(rootDir, 'sea-prep.blob');
    
    if (platform === 'win32') {
      // Windows 使用 postject
      try {
        execSync(`npx postject "${outputPath}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.log('📦 postject 未安装，正在安装...');
        execSync('npm install -g postject', { stdio: 'inherit' });
        execSync(`npx postject "${outputPath}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, {
          stdio: 'inherit'
        });
      }
    } else {
      // Linux/macOS 使用 postject 或直接注入
      try {
        execSync(`npx postject "${outputPath}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.log('📦 postject 未安装，正在安装...');
        execSync('npm install -g postject', { stdio: 'inherit' });
        execSync(`npx postject "${outputPath}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, {
          stdio: 'inherit'
        });
      }
    }
    
    console.log('✅ blob 注入完成');

    // 步骤 5: 设置可执行权限（非 Windows）
    if (platform !== 'win32') {
      console.log('🔐 正在设置可执行权限...');
      await fs.chmod(outputPath, '755');
      console.log('✅ 可执行权限设置完成');
    }

    // 复制必要的资源文件
    console.log('📁 正在复制资源文件...');
    const resourceFiles = [
      'config.yml',
      'Comismsh.ttf',
    ];
    
    for (const file of resourceFiles) {
      const srcPath =  path.posix.join(distDir, file);
      const destPath =  path.posix.join(outputDir, file);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`  ✅ ${file} 复制完成`);
      }
    }

    // 复制目录
    const resourceDirs = ['common', 'config', 'frontend', 'lib', 'module'];
    for (const dir of resourceDirs) {
      const srcPath =  path.posix.join(distDir, dir);
      const destPath =  path.posix.join(outputDir, dir);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`  ✅ ${dir}/ 目录复制完成`);
      }
    }

    // 清理临时文件
    console.log('🧹 正在清理临时文件...');
    const tempFiles = [
       path.posix.join(rootDir, 'sea-prep.blob')
    ];
    
    for (const file of tempFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }

    console.log('✅ 临时文件清理完成');

    // 显示结果
    const stats = await fs.stat(outputPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n🎉 单文件可执行应用程序创建成功！');
    console.log(`📍 输出位置: ${outputPath}`);
    console.log(`📏 文件大小: ${sizeInMB} MB`);
    console.log(`🖥️  平台: ${platform}`);
    console.log('\n🚀 您现在可以运行以下命令测试应用程序:');
    console.log(`   ${outputPath}`);

  } catch (error) {
    console.error('❌ 创建单文件可执行应用程序失败:', error.message);
    process.exit(1);
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  createSEA();
}

module.exports = createSEA;
