Page({
  data: {
    schools: []
  },
  onLoad: function() {
    wx.cloud.callFunction({
      name: 'loadSchools',
      success: res => {
        if (res.result.success) {
          this.setData({
            schools: res.result.data
          })
        } else {
          console.error('加载数据失败：', res.result.error)
        }
      },
      fail: err => {
        console.error('调用云函数失败：', err)
      }
    })
  }
})
