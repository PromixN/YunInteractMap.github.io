export const getParametRequest = (url: string) => {
  //var url = user_url; //获取url中"?"符后的字串
  url = url ? url : window.location.search; //获取url中"?"符后的字串
  const theRequest: Record<string, string> = {};
  const start = url.indexOf("?");
  if (start != -1) {
    const str = url.substring(start + 1);
    const strs = str.split("&");
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
};

//判断手机型号
export const getPhoneType = () => {
  let os = 0; 
  if (/(iPhone|iPad|iPod|ios)/i.test(navigator.userAgent)) {
    os = 2;
  } else if (/(Android)/i.test(navigator.userAgent)) {
    os = 1;
  }
  return os;
};

// 判断平台
export const isPc = () => {
  let bool = false
  const userAgent =  navigator?.userAgent
  if(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini)/i.test(userAgent) ){
    bool = false
  }else{
    bool = true               
  }
  return bool
}
