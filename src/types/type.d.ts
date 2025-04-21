
export interface MarkerPosition {
  x?:number | undefined;
  y?:number | undefined;
}

interface GameMap {
  iconUrl:string
  name:string
  id:Record<number,number>
}

export interface MarkerFormData {
  name?:string
  description?:string
  landmark?:GameMap
  x:number
  y:number
  z:number
  iconUrl?:string
  gameMapId?:number
  gameMapName?:string
}