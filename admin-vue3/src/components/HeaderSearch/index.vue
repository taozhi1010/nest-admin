<template>
  <div class="header-search">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="openSearch" />
    <SearchModal ref="searchModalRef" />
  </div>
</template>

<script setup>
import SearchModal from './components/SearchModal'

const searchModalRef = ref(null)

function openSearch() {
  searchModalRef.value?.open()
}
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }
}
</style>
