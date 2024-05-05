<template>
	<div>
		<svg-icon icon-class="github" @click="goto" />
	</div>
</template>

<script>
export default {
	name: 'RuoYiGit',
	data() {
		return {
			url: 'https://github.com/taozhi1010/nest-admin',
		};
	},
	methods: {
		goto() {
			window.open(this.url);
		},
	},
};
</script>
