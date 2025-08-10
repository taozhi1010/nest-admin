#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 替换 dist_ncc/index.js 文件中的所有 __dirname 为 import.meta.dirname
 */
function replaceDirname() {
  const targetFile = path.join(__dirname, '..', 'dist_ncc', 'index.js');
  
  console.log('开始处理文件:', targetFile);
  
  // 检查文件是否存在
  if (!fs.existsSync(targetFile)) {
    console.error('❌ 文件不存在:', targetFile);
    process.exit(1);
  }
  
  try {
    // 读取文件内容
    console.log('📖 正在读取文件...');
    const content = fs.readFileSync(targetFile, 'utf8');
    
    // 统计 __dirname 出现次数
    const dirnameMatches = content.match(/__dirname/g);
    const dirnameCount = dirnameMatches ? dirnameMatches.length : 0;
    
    console.log(`📊 找到 ${dirnameCount} 个 __dirname 需要替换`);
    
    if (dirnameCount === 0) {
      console.log('✅ 文件中没有找到 __dirname，无需替换');
      return;
    }
    
    // 执行替换
    console.log('🔄 正在执行替换...');
    const newContent = content.replace(/__dirname/g, 'import.meta.dirname');
    
    // 创建备份文件
    const backupFile = targetFile + '.backup.' + Date.now();
    console.log('💾 创建备份文件:', path.basename(backupFile));
    fs.writeFileSync(backupFile, content, 'utf8');
    
    // 写入新内容
    fs.writeFileSync(targetFile, newContent, 'utf8');
    
    // 验证替换结果
    const verifyContent = fs.readFileSync(targetFile, 'utf8');
    const remainingDirname = verifyContent.match(/__dirname/g);
    const remainingCount = remainingDirname ? remainingDirname.length : 0;
    
    console.log('✅ 替换完成!');
    console.log(`📈 替换统计: ${dirnameCount} → ${dirnameCount - remainingCount} 个 __dirname 已替换`);
    
    if (remainingCount > 0) {
      console.warn(`⚠️  仍有 ${remainingCount} 个 __dirname 未替换，可能在注释或字符串中`);
    }
    
    console.log(`💾 备份文件: ${path.basename(backupFile)}`);
    
  } catch (error) {
    console.error('❌ 处理文件时发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🚀 开始替换 __dirname 为 import.meta.dirname');
  console.log('=' .repeat(50));
  replaceDirname();
  console.log('=' .repeat(50));
  console.log('🎉 脚本执行完成');
}

module.exports = { replaceDirname };
