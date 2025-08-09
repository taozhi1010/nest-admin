import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

/**
 * 将所有非node_modules的文件打包到zip文件
 */
class ZipNotNodeModules {
	constructor(options = {}) {
		this.sourceDir = options.sourceDir || process.cwd();
		this.outputPath = options.outputPath || path.join(this.sourceDir, 'project-backup.zip');
		this.excludePatterns = options.excludePatterns || [
			'node_modules',
			'.git',
			'dist',
			'.DS_Store',
		];
	}

	/**
	 * 检查路径是否应该被排除
	 * @param {string} filePath 文件路径
	 * @returns {boolean} 是否应该排除
	 */
	shouldExclude(filePath) {
		const relativePath = path.relative(this.sourceDir, filePath);
		const pathParts = relativePath.split(path.sep);

		return this.excludePatterns.some(pattern => {
			// 检查是否匹配目录名
			if (pathParts.includes(pattern)) {
				return true;
			}

			// 检查是否匹配文件扩展名模式
			if (pattern.startsWith('*') && filePath.endsWith(pattern.slice(1))) {
				return true;
			}

			// 检查是否匹配完整路径
			if (relativePath.includes(pattern)) {
				return true;
			}

			return false;
		});
	}

	/**
	 * 递归获取所有文件
	 * @param {string} dir 目录路径
	 * @returns {Array<string>} 文件路径列表
	 */
	getAllFiles(dir) {
		const files = [];

		try {
			const items = fs.readdirSync(dir);

			for (const item of items) {
				const fullPath = path.join(dir, item);

				if (this.shouldExclude(fullPath)) {
					console.log(`排除: ${path.relative(this.sourceDir, fullPath)}`);
					continue;
				}

				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					files.push(...this.getAllFiles(fullPath));
				} else {
					files.push(fullPath);
				}
			}
		} catch (error) {
			console.error(`读取目录失败 ${dir}:`, error.message);
		}

		return files;
	}

	/**
	 * 创建zip文件
	 * @returns {Promise<void>}
	 */
	async createZip() {
		return new Promise((resolve, reject) => {
			console.log(`开始创建zip文件: ${this.outputPath}`);
			console.log(`源目录: ${this.sourceDir}`);
			console.log(`排除模式: ${this.excludePatterns.join(', ')}`);

			// 创建输出目录（如果不存在）
			const outputDir = path.dirname(this.outputPath);
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			// 创建输出流
			const output = fs.createWriteStream(this.outputPath);
			const archive = archiver('zip', {
				zlib: { level: 9 } // 最高压缩级别
			});

			// 监听输出流事件
			output.on('close', () => {
				const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
				console.log(`\n✅ 打包完成！`);
				console.log(`📦 文件大小: ${sizeInMB} MB`);
				console.log(`📁 文件位置: ${this.outputPath}`);
				resolve();
			});

			// 监听错误事件
			archive.on('error', (err) => {
				console.error('❌ 打包失败:', err);
				reject(err);
			});

			// 监听进度
			archive.on('progress', (progress) => {
				const percent = ((progress.entries.processed / progress.entries.total) * 100).toFixed(1);
				process.stdout.write(`\r📦 处理进度: ${percent}% (${progress.entries.processed}/${progress.entries.total})`);
			});

			// 连接输出流
			archive.pipe(output);

			// 获取所有文件并添加到压缩包
			console.log('\n🔍 扫描文件...');
			const files = this.getAllFiles(this.sourceDir);

			console.log(`\n📋 找到 ${files.length} 个文件需要打包`);

			for (const file of files) {
				const relativePath = path.relative(this.sourceDir, file);
				archive.file(file, { name: relativePath });
			}

			// 完成打包
			archive.finalize();
		});
	}

	/**
	 * 运行打包程序
	 */
	async run() {
		try {
			console.log('🚀 开始打包程序...\n');

			// 检查源目录是否存在
			if (!fs.existsSync(this.sourceDir)) {
				throw new Error(`源目录不存在: ${this.sourceDir}`);
			}

			await this.createZip();

		} catch (error) {
			console.error('\n❌ 打包失败:', error.message);
			process.exit(1);
		}
	}
}

// 主程序
async function main() {
	// 解析命令行参数
	const args = process.argv.slice(2);
	const sourceDir = args[0] || process.cwd();
	const outputPath = args[1] || path.join(sourceDir, `project-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`);

	// 创建打包实例
	const zipper = new ZipNotNodeModules({
		sourceDir,
		outputPath,
		excludePatterns: [
			'node_modules',
			'.git',
			'dist',
			'.DS_Store',
		]
	});

	// 运行打包
	await zipper.run();
}

main().catch(console.error);