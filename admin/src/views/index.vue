<template>
	<div class="app-container home">
		<el-row :gutter="20">
			<el-col :sm="24" :lg="12" style="padding-left: 20px">
				<h2>nest-admin后台管理框架</h2>
				<p>
					nest-admin管理系统基于Ruoyi框架使用nestjs实现，她可以用于所有的Web应用程序，如网站管理后台，网站会员中心，CMS，CRM，OA等等，当然，您也可以对她进行深度定制，以做出更强系统。所有前端后台代码封装过后十分精简易上手，出错概率低。系统会陆续更新一些实用功能。
				</p>
				<p>
					<b>当前版本:</b> <span>v{{ version }}</span>
				</p>
				<p>
					<el-tag type="danger">免费开源</el-tag>
				</p>
				<p>
					<el-button type="primary" size="mini" icon="el-icon-cloudy" plain
						@click="goTarget('https://gitee.com/tao-zhi/nest-admin')">访问码云</el-button>
					<el-button size="mini" icon="el-icon-s-home" plain
						@click="goTarget('https://nest-admin.dooring.vip/prod-api/swagger-ui')">访问文档</el-button>
				</p>
			</el-col>

			<el-col :sm="24" :lg="12" style="padding-left: 50px">
				<el-row>
					<el-col :span="12">
						<h2>技术选型</h2>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="6">
						<h4>后端技术</h4>
						<ul>
							<li>node</li>
							<li>nestjs</li>
							<li>typeorm</li>
							<li>redis</li>
							<li>mysql</li>
							<li>...</li>
						</ul>
					</el-col>
					<el-col :span="6">
						<h4>前端技术</h4>
						<ul>
							<li>Vue</li>
							<li>Vuex</li>
							<li>Element-ui</li>
							<li>Axios</li>
							<li>Sass</li>
							<li>Quill</li>
							<li>...</li>
						</ul>
					</el-col>
				</el-row>
			</el-col>
		</el-row>
		<el-divider />
		<el-row :gutter="20">
			<el-col :xs="24" :sm="24" :md="12" :lg="8">
				<el-card class="update-log">
					<div slot="header" class="clearfix">
						<span>联系信息</span>
					</div>
					<div class="body">
						<p><i class="el-icon-s-promotion"></i> 官网：<el-link href="https://nest-admin.dooring.vip/"
								target="_blank">https://nest-admin.dooring.vip/</el-link></p>
						<p><i class="el-icon-chat-dot-round"></i> 微信：<a href="javascript:;">taozhi10100</a></p>
					</div>
				</el-card>
			</el-col>
			<el-col :xs="24" :sm="24" :md="12" :lg="8">
				<el-card class="update-log">
					<div slot="header" class="clearfix">
						<span>更多优质产品</span>
					</div>
					<div class="body">
						<p>
							<el-link href="https://h5dooring.online" target="_blank">H5-Dooring</el-link>
						</p>
						<p>
							<el-link href="https://v6.dooring.vip/" target="_blank">V6-Dooring</el-link>
						</p>
						<p>
							<el-link href="https://board.dooring.vip/" target="_blank">创意白板</el-link>
						</p>
					</div>
				</el-card>
			</el-col>
			<!-- <el-col :xs="24" :sm="24" :md="12" :lg="8">
				<el-card class="update-log">
					<div slot="header" class="clearfix">
						<span>捐赠支持</span>
					</div>
					<div class="body">
						<img src="@/assets/images/pay.png" alt="donate" width="100%" />
						<span style="display: inline-block; height: 30px; line-height: 30px">你可以请作者喝杯咖啡表示鼓励</span>
					</div>
				</el-card>
			</el-col> -->
		</el-row>
	</div>
</template>

<script>
export default {
	name: 'Index',
	data() {
		return {
			// 版本号
			version: '1.0.0',
		};
	},
	methods: {
		goTarget(href) {
			window.open(href, '_blank');
		},
	},
};
</script>

<style scoped lang="scss">
.home {
	blockquote {
		padding: 10px 20px;
		margin: 0 0 20px;
		font-size: 17.5px;
		border-left: 5px solid #eee;
	}

	hr {
		margin-top: 20px;
		margin-bottom: 20px;
		border: 0;
		border-top: 1px solid #eee;
	}

	.col-item {
		margin-bottom: 20px;
	}

	ul {
		padding: 0;
		margin: 0;
	}

	font-family: 'open sans',
	'Helvetica Neue',
	Helvetica,
	Arial,
	sans-serif;
	font-size: 13px;
	color: #676a6c;
	overflow-x: hidden;

	ul {
		list-style-type: none;
	}

	h4 {
		margin-top: 0px;
	}

	h2 {
		margin-top: 10px;
		font-size: 26px;
		font-weight: 100;
	}

	p {
		margin-top: 10px;

		b {
			font-weight: 700;
		}
	}

	.update-log {
		ol {
			display: block;
			list-style-type: decimal;
			margin-block-start: 1em;
			margin-block-end: 1em;
			margin-inline-start: 0;
			margin-inline-end: 0;
			padding-inline-start: 40px;

			li {
				line-height: 24px;
			}
		}
	}
}
</style>
