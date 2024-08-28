// el-form只有一个框的时候取消提交
export default {
  created() {
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    },
  },
};
