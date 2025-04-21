<script setup lang="ts">
import { useCommonStore } from '@/stores/common'

defineOptions({ name: 'SelectMap' })

const commonStore = useCommonStore()

function handleClick(id: number) {
  commonStore.changeMapIdAction(id)
}

function handleExport() {
  commonStore.exportMapInfoAction(commonStore.mapId)
}

onMounted(() => {
  commonStore.loadMapListAction()
})
</script>

<template>
  <div class="select-map">
    <div
      v-for="item in commonStore.mapList"
      class="select-map-item"
      :class="{
        cur: item.id === commonStore.mapId
      }"
      :key="item.id"
      @click="handleClick(item.id)"
    >
      {{ item.regionName }}
    </div>
  </div>
  <div class="export-mapinfo">
    <el-button
      type="primary"
      icon="el-icon-download"
      @click="handleExport"
    >
      导出地图信息
    </el-button>
  </div>
</template>


<style lang="scss" scoped>
  @use '@/assets/UiView.scss';
</style>
