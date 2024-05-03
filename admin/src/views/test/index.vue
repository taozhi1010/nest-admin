<template>
	<div class="app-container home">
		<input type="file" name="" id="" @input="onChange" />
		<el-button @click="onRepeat">重新上传</el-button>
		<el-button @click="onMerge">合并</el-button>

		<div>
			<input type="file" name="" id="" @input="onChangeSingle" />
		</div>
	</div>
</template>

<script>
import { uploadChunk, mergeChunk, getUploadId, upload } from '@/api/common/upload';
import SparkMD5 from 'spark-md5';
import COS from 'cos-js-sdk-v5';

export default {
	name: 'Index',
	data() {
		return {
			// 版本号
			version: '3.8.7',
			md5: '',
			fileName: '',
			file: '',
			cos: null,
			progressInfo: {},
		};
	},
	created() {
		this.getCosInstance();
	},

	methods: {
		// 初始化 cos 实例/鉴权
		getCosInstance() {
			let cos = new COS({
				getAuthorization: function (options, callback) {
					console.log('options', options);
					var url = 'http://127.0.0.1:3000/sts'; // 鉴权接口地址
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, true);
					xhr.onload = function (e) {
						try {
							var data = JSON.parse(e.target.responseText);
							var credentials = data.credentials;
						} catch (e) {}
						if (!data || !credentials) return console.error('credentials invalid');
						callback({
							TmpSecretId: credentials.tmpSecretId,
							TmpSecretKey: credentials.tmpSecretKey,
							XCosSecurityToken: credentials.sessionToken,
							StartTime: data.startTime, // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
							ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000900
						});
					};
					xhr.send();
				},
			});
			this.cos = cos;
		},
		onMerge() {
			mergeChunk({ uploadId: this.md5, fileName: this.fileName }).then((res) => {
				console.log();
			});
		},
		async onChange(e) {
			const file = e.target.files[0];
			this.file = file;
			// const md5 = await this.createMD5(file);
			const res = await getUploadId();
			const md5 = res.data.uploadId;
			this.md5 = md5;
			const chunks = this.createChunks(file, 1024 * 1024);
			const fileName = file.name;
			this.fileName = fileName;
			this.uploadChunks(chunks, md5, fileName).then((res) => {
				this.onMerge();
			});
		},
		async onRepeat() {
			const file = this.file;
			const md5 = await this.createMD5(file);
			this.md5 = md5;
			const chunks = this.createChunks(file, 1024 * 1024);
			const fileName = file.name;
			this.fileName = fileName;
			this.uploadChunks(chunks, md5, fileName).then((res) => {
				this.onMerge();
			});
		},
		async onChangeSingle(e) {
			const file = e.target.files[0];
			this.cos.uploadFile(
				{
					Bucket: 'dooring-1255387136',
					Region: 'ap-chongqing',
					Key: file.name,
					Body: file,
					SliceSize: 1024 * 1024, // 大于1mb才进行分块上传
					onTaskReady: (tid) => {
						this.progressInfo.taskId = tid;
						Object.assign(this.progressInfo, {
							taskId: tid,
							status: 'uploading',
						});
					},
					onProgress: (progressData) => {
						console.log('上传中', JSON.stringify(progressData));
						let text = cosUploadUtils.getProgressText(progressData);
						Object.assign(this.progressInfo, {
							percent: Math.floor(progressData.percent * 100),
							text,
							name: file.name,
						});
					},
				},
				(err, data) => {
					console.log(err, data);
					// 上传成功
					if (!err) {
						let { statusCode, Location, ETag, RequestId } = data;
						this.successList.push({
							name: this.progressInfo.name,
							url: Location,
						});
						// 初始化进度信息
						Object.assign(this.progressInfo, {
							percent: 0,
							text: '',
							name: '',
							taskId: '',
							status: '',
							url: '',
						});
					}
				}
			);

			// this.uploadSingleFile(file);
		},

		async uploadSingleFile(file) {
			const formData = new FormData();
			formData.append('file', file);
			return upload(formData);
		},
		/*
		 * @description 创建文件的MD5值,根据文件大小动态选择分片大小和快速循环的方式
		 * @param {Object} file el文件对象或文件对象
		 * @return {String} MD5 值
		 * */

		createMD5(file) {
			const maxChunkSize = 1024 * 1024; // 每次处理数据块的最大值，1MB
			const chunksPerCycle = 100; // 每个计算周期中处理的数据块数
			file = file.raw || file;
			let stamp = Date.now();
			console.time('md计算耗时' + stamp);
			return new Promise((resolve, reject) => {
				// 分片放worker处理
				const fileReader = new FileReader();
				try {
					let currentChunk = 0;
					const totalChunks = Math.ceil(file.size / maxChunkSize);
					const spark = new SparkMD5.ArrayBuffer();
					// 处理数据块
					const processChunk = (start) => {
						try {
							const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
							const end = Math.min(start + maxChunkSize, file.size);
							const chunk = blobSlice.call(file, start, end);
							fileReader.readAsArrayBuffer(chunk);
						} catch (e) {
							console.error(e);
						}
					};
					// 文件读取成功
					fileReader.onload = () => {
						spark.append(fileReader.result); // 将当前数据块内容追加到 MD5 计算器
						currentChunk += 1;
						if (currentChunk >= totalChunks) {
							const md5Hash = spark.end(); // 完成 MD5 计算
							spark.destroy(); // 销毁计算器
							fileReader.abort(); //释放资源
							console.timeEnd('计算MD5');
							console.log('------->>3333');
							return resolve(md5Hash);
						} else if (currentChunk % chunksPerCycle === 0) {
							// 在处理指定数量的数据块后，设置一个任务延迟以使 UI 线程有空间处理
							setTimeout(() => {
								processChunk(currentChunk * maxChunkSize);
							}, 0);
						} else {
							// 继续处理下一个数据块
							processChunk(currentChunk * maxChunkSize);
						}
					};
					fileReader.onerror = (e) => {
						console.error(e);
						return reject(e);
					};
					// 开始处理第一个数据块
					processChunk(0);
				} catch (e) {
					fileReader.abort();
					reject(e);
				} finally {
				}
			});
		},
		/**
		 * 文件分片
		 * @param file 文件对象
		 * @param chunksize 分片大小
		 */
		createChunks(file, chunksize) {
			const chunks = [];
			for (let i = 0; i < file.size; i += chunksize) {
				chunks.push(file.slice(i, i + chunksize));
			}
			return chunks;
		},
		/**
		 * 上传chunk
		 * @param item chunks
		 * @param md5 加密串
		 * @param fileName 文件名
		 * @param index 下标：失败辅助标识
		 */
		uploadLargeFile(item, md5 = '', fileName = '', index = -1) {
			const formData = new FormData();
			formData.append('file', item);
			formData.append('uploadId', md5);
			formData.append('fileName', fileName);
			formData.append('index', index);
			return uploadChunk(formData);
		},

		/**
		 * 循环上传chunks
		 * @param chunks
		 * @param md5 加密串
		 * @param fileName 文件名
		 */
		uploadChunks(chunks = [], md5 = '', fileName = '') {
			const allRequest = chunks.map((item, index) => {
				return this.uploadLargeFile(item, md5, fileName, index);
			});
			console.log('------->>111');
			return Promise.all(allRequest);
		},
	},
};
</script>

<style scoped lang="scss">
.home {
}
</style>
