import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCommonStore } from '@/stores/common'
// import ejs from 'ejs'
// import { getPopupTmpl, getMarkerTmpl } from '@/api' //获取弹窗和标记模板


const ZOOM_LIMIT = { maxZoom: 12, minZoom: 9 } as const //最大最小缩放等级
const TILE_UTL_TEMP = 'maps/{id}/{z}/{x}_{y}.png' as const //瓦片模板
const DEFAULT_MAP_ID = '48' as const //默认初始地图
// 瓦片模板Map  三张地图 48 49 61  都有12-9的缩放等级
const TileUrlTempMap = new Map([
  ['48', TILE_UTL_TEMP],
  ['49', 'maps/{id}/{z}/{x}_{y}.png'],
  ['61', 'maps/{id}/{z}/{x}_{y}.png']
])



//定义class
export class MapInstance {
  public map: L.Map | void = void 0 // 0.地图实例  
  private tileLayer: L.TileLayer | void = void 0 // 1.瓦片图 
  private zoomControl: L.Control.Zoom | void = void 0 // 2.缩放控件
  private layerGroup: L.LayerGroup | void = void 0 // 3.标点
  constructor(private debug: boolean = false) {//构造函数 
    // this.getTemplates()//EJS改造为模板语法后 注释掉
  }
  
  // private markerTmpl: string | void = void 0 //标记模板
  // private popupTmpl: string | void = void 0 //弹窗模板
  // private async getTemplates() {
  //   this.markerTmpl = await getMarkerTmpl() //获取地图标点ejs模板DOM
  //   this.popupTmpl = await getPopupTmpl() //获取标点弹窗ejs模板DOM
  // }
  private Common: any = void 0 //引入pinia store

  // 🔺 0.地图实例初始化
  init(target: HTMLElement | string, onClick?: (lng: number, lat: number) => void) {
    this.map = L.map(target, {
      ...ZOOM_LIMIT,//最大最小缩放等级
      crs: L.CRS.Simple,//CRS坐标参考系  L.CRS.Simple是一个简单的CRS，将经度和纬度直接映射到x和y。注意，y轴应该仍然是倒置的（从底部到顶部）。返回简单的欧几里德距离。
      zoom: 10,//初始缩放等级
      zoomControl: false,//缩放控件 固定样式不适用 自己写renderZoomControl
      attributionControl: false,//版权控件
      center: L.latLng(0, 0),//中心点  L.CRS.Simple的值左上角到右下角为0到1  地图中心即 -0.5,0.5
      maxBounds: L.latLngBounds(L.latLng(-2, -1), L.latLng(1, 2))//最大边界控制
    })
    this.Common = useCommonStore() //引入pinia store

    // 打印当前坐标
    this.debug &&
      this.map.on('click', (event) => {
        onClick?.(event.latlng.lat, event.latlng.lng,)
        console.log('click cordinate', event.latlng.lat, event.latlng.lng,)//debug为true时 console会输出点击的坐标值
      })
  }


  //🔺 1.瓦片图渲染
  renderTile(id: string = DEFAULT_MAP_ID) {
    if (!this.map) return

    if (this.tileLayer) {// 多张地图切换 渲染瓦片需要清除上一次的残留
      this.layerGroup?.clearLayers()// 清除标点
      this.tileLayer.remove() // 移除瓦片图层
      this.tileLayer = void 0 // 将瓦片图层设置为undefined
    }

    // 渲染瓦片
    // 从一个Map中根据id获取瓦片地图的URL模板  如果找不到，则使用 ??（空值合并运算符）返回默认值 TILE_UTL_TEMP
    this.tileLayer = L.tileLayer(TileUrlTempMap.get(id) ?? TILE_UTL_TEMP, { ...ZOOM_LIMIT, id })
    this.tileLayer.addTo(this.map) // 将瓦片图层添加到地图上
    this.map.setView(L.latLng(-0.75, 0.75), 10) // 并将中心位置设置为0.5,0.5 缩放等级为10
  }


  // 🔺 2.缩放控件渲染
  renderZoomControl() {
    if (!this.map) return

    // 创建一个缩放控件 位置在右下角 没有放大缩小文字 手动通过CSS样式加载图片来修改样式
    this.zoomControl = L.control.zoom({ position: 'bottomright', zoomInText: '', zoomOutText: '' })
    // 将缩放控件添加到地图上
    this.zoomControl.addTo(this.map)
  }


  // 🔺 3.标点渲染
  renderMarkers(marks: any[]) {
    if (!this.map) return
    // 清除之前的标点
    this.layerGroup?.clearLayers()

    const markPoints = marks.map((mark) => {
      // 数据准备
      const { x, y, name, description, iconUrl } = mark

      /** 使用ejs模板渲染。但简单标记使用模板字符串足够，复杂的建议使用Vue组件 **/
      // const contentHtml = ejs.render(this.markerTmpl ?? '', {
      //   name,
      //   iconUrl
      // })
      const contentHtml = `
        <div class="marker-wrapper">
          <div class="marker-title">
            ${name}
          </div>
          <img src="${iconUrl}">
        </div>
      `;

      // 创建一个地图标记点：L.marker(  地理坐标点: L.latLng(x, y)、自定义FF标记DOM实例: L.divIcon()  ) 
      const marker = L.marker(L.latLng(x, y), {
        icon: L.divIcon({
          className: 'marker-icon',
          html: contentHtml
        })
      })

      // 创建标点弹窗
      const PopupHtml = `
        <div class="point-popup-container">
          <div class="popup-title">
            ${name}
            <img src="${iconUrl}">
          </div>
          <div class="popup-content">
            ${description}
          </div>
        </div>
      `;
      marker.bindPopup(() => {
          const container = document.createElement('div');
          container.className = 'point-popup-container';
          container.innerHTML = PopupHtml;
          const button = document.createElement('button');
          button.textContent = '删除此标记';
          
          // 点击按钮时删除Marker并关闭弹出窗口
          button.onclick = () => {
            this.DeleteMark(name, x, y);
          };
         container.appendChild(button);
         return container;
        }
        // L.popup({
        //   content: PopupHtml
        //   // content: ejs.render(this.popupTmpl ?? '', {
        //   //   name,
        //   //   iconUrl,
        //   //   description
        //   // })
        // })
      )
      // console.log('marker', marker.getPopup())
      // marker.getPopup()?.getElement()?.getElementsByClassName('point-popup-container')[0].addEventListener('click', (e)=>{this.DeleteMark(name, x, y)})//删除标记点的逻辑

      return marker
    })

    this.layerGroup = L.layerGroup(markPoints).addTo(this.map)
  }

  DeleteMark(name: string, x: number, y: number) {
    // 删除标记点的逻辑
    console.log(`删除标记点: ${name}, 坐标: (${x}, ${y})`)
    this.Common.DeleteMarker(name, x, y)
  }

  // 🔺 4.开启标点模式 替换光标
  addMarker() {
    if (!this.map) return
    L.DomUtil.addClass(this.map.getContainer(),'leaflet-cursor-pointer');
  }
  // 🔺 5.移除标点模式 恢复光标
  removeMarker() {
    if (!this.map) return
    L.DomUtil.removeClass(this.map.getContainer(),'leaflet-cursor-pointer');
  }
}

export default MapInstance
