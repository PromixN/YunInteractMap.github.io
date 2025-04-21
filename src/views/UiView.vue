<script setup lang="ts">
import { useCommonStore } from '@/stores/common'
import SelectMap from '@/components/SelectMap.vue'
import MarkerGroup from '@/components/MarkerGroup.vue'
import { isPc } from '@/utils/common'

defineOptions({ name: 'UIView' })

const commonStore = useCommonStore()

const markCatalogGroups = computed(() => commonStore?.mapInfo?.landmarkCatalogGroups ?? [])

onMounted(() => {
  commonStore.loadMapInfoAction()
})

// 尝试右键菜单添加标记点
</script>
<template>
  <div class="scrollbar-view" :class="{'scrollbar-mobile':!isPc()}">
    <div class="filter-container">
      <div class="navigator-logo">
        <img src="@/assets/images/logo.png" alt="logo" />
      </div>
      <select-map />
      <template v-if="markCatalogGroups">
        <marker-group
          v-for="group in markCatalogGroups"
          :key="group.id"
          :title="group.groupName"
          :items="group.landmarkCatalogs"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use '@/assets/UiView.scss';
</style>
