const api = require('../../utils/api');

Page({
  data: {
    schools: []
  },
  onLoad: function() {
    api.callFunction({
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
          console.error('调用接口失败：', err)
      }
    })
  }
})
