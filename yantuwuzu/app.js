// app.js
App({
  globalData: {
    userInfo: null
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    wx.cloud.init({
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      env: 'yantuwuzu-8gp8d82nd7393b70',
      // 是否在将用户访问记录到用户管理中，在控制台中可见，默认为false
      traceUser: true,
    });
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {}

    // 获取 openid
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        this.globalData.openid = res.result.openid
        wx.setStorageSync('openid', res.result.openid)
      },
      fail: err => {
        console.error('获取 openid 失败', err)
      }
    })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
  
})


