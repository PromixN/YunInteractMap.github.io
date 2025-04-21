<script setup lang="ts">
import { useTemplateRef, ref } from 'vue'
import { useCommonStore } from '@/stores/common'

// leaflet相关逻辑类  抛出init初始化等方法
import MapInstance from '@/logics/MapInstance'
import MarkerForm from '@/components/MarkerForm.vue'
import type { MarkerFormData } from '@/types/type'
import { isPc } from '@/utils/common'

defineOptions({ name: 'MapView' })

const commonStore = useCommonStore()

// VUE3.5新特性  钩子传入dom的ref mapRef.value来使用
const mapRef = useTemplateRef<HTMLDivElement & { _map?: L.Map }>('map')
// new一个 MapInstance 地图逻辑类的实例 mapInstance
const mapInstance: MapInstance = new MapInstance(true)
// 控制表单显示
const formVisible = ref(false)

function initMap() {
  if (mapRef.value == null) {
    console.warn('地图DOM不存在')
    return
  }
  // 🔺 0.初始化地图实例
  mapInstance.init(mapRef.value,addMarkerFrom)
  // 🔺 1.渲染瓦片
  mapInstance.renderTile()
  // 🔺 2.渲染缩放控件
  mapInstance.renderZoomControl()
}


onMounted(() => {
  initMap()
})

watch(
  () => commonStore.markers,
  (val) => {
    // 🔺 3.渲染标记点
    if (mapInstance.map == null) {
      setTimeout(() => mapInstance.renderMarkers(val), 100)
      return
    }
    mapInstance.renderMarkers(val)
  },
  {
    immediate: true
  }
)

watch(
  () => commonStore.mapId,
  (id) => mapInstance.renderTile(id + '')
)

// 🔺 4.添加标记点
const addMarkerAction = () => {
  commonStore.markStatusAction(true)
  mapInstance.addMarker()
}
// 🔺 5.关闭标记点
const closeTipsAction = () => {
  commonStore.markStatusAction(false)
  mapInstance.removeMarker()
}

// 修改添加标记点回调
const addMarkerFrom = (lng: number, lat: number) => {
  if (!commonStore.markStatus) return
  commonStore.setCurMarkerAction({ x: lng, y: lat })
  formVisible.value = true
  // 自动退出标点模式
  closeTipsAction()
}

// 处理表单提交
const handleMarkerSubmit = async (markerData: MarkerFormData) => {
  // 这里可以调用 store 的方法保存数据
  await commonStore.addMarker(markerData)
  commonStore.addMarkCatalogAction(markerData.landmark?.id[commonStore.mapId])
  mapInstance.renderMarkers(commonStore.markers)
}
</script>

<template>
  <div class="map-wrapper" :class="{'map-mobile':!isPc()}" ref="map"></div>
  <div class="add-marker" @click="addMarkerAction" v-if="isPc()">
    <div class="add-marker-btn">
      <img src="../assets/images/addIcon.png"/>
      添加标记点
    </div>
  </div>
  <div class="addMarker-tips flex-center" v-show="commonStore.markStatus">
    左键长按拖动地图 单击添加标点 【数据只保存本地 刷新后丢失 导出地图按钮下载标点文件】
    <div class="close-icon flex-center" @click="closeTipsAction">×</div>
  </div>
  
  <!-- 添加表单组件 -->
  <marker-form
    v-model="formVisible"
    :coordinates="commonStore.curMarker"
    :game-map-id="commonStore.mapId"
    :game-map-name="commonStore.mapName"
    @submit="handleMarkerSubmit"
  />
</template>

<style lang="scss" scoped>
  @use '@/assets/MapView.scss';
</style>
