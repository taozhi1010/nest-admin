<template>
	<div>
		<svg-icon icon-class="question" @click="goto" />
	</div>
</template>

<script>
export default {
	name: 'RuoYiDoc',
	data() {
		return {
			url: 'https://nest-admin.dooring.vip/prod-api/swagger-ui',
		};
	},
	methods: {
		goto() {
			window.open(this.url);
		},
	},
};
</script>
