// index.js
// pages/inquiry/inquiry.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    wx.showLoading({
      title: '正在加载数据中',
    })
    wx.request({
      complete:()=>{
        wx.hideLoading()
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getPhoneNumber(e) {
    console.log(e.detail.code); // 动态令牌

    wx.cloud.callFunction({
      name: 'cloudbase_module',
      data: {
        name: 'wx_user_get_phone_number',
        data: {
          code: e.detail.code,
        },
      },
      success: (res) => {
        const phoneInfo = res.result?.phoneInfo;
        console.log('获取到的手机号信息: ', phoneInfo);
      },
      
    });
  },
  
})
