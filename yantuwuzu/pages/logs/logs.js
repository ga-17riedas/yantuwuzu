const app = getApp();
Page({
  data: {
    username: "",
    userprofile: ""
  },
  // 登录
  login(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 描述授权的目的
      success: res => {
        app.globalData.userInfo = res.userInfo;
        wx.setStorageSync('user', app.globalData.userInfo);
        this.setData({
          userprofile: app.globalData.userInfo.avatarUrl,
          username: app.globalData.userInfo.nickName
        });
        this.uploadUserInfo(res.userInfo);
      },
      fail: res => {
        wx.showToast({
          title: '授权失败，请重新登录',
          icon: "none",
        });
      }
    });
  },
  // 上传用户信息到云数据库
  uploadUserInfo(userInfo) {
    const openid = wx.getStorageSync('openid'); // 从本地存储中获取 openid
    wx.cloud.callFunction({
      name: 'uploadUserInfo',
      data: {
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        openid: openid
      },
      success: res => {
        console.log('用户信息上传成功', res);
      },
      fail: err => {
        console.error('用户信息上传失败', err);
      }
    });
  },
  // 退出
  logout(e) {
    wx.showModal({
      title: '',
      content: '确认退出',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('user');
          app.globalData.userInfo = null;
          this.setData({
            userprofile: "",
            username: ""
          });
        }
      }
    });
  },
  // 基本信息
  basicInfo(e) {
    wx.navigateTo({
      url: '/pages/basicInfo/basicInfo'
    });
  },
  // 页面跳转
  gotoShuoming(e) {
    wx.navigateTo({
      url: '/pages/shuoming/shuoming'
    });
  },
  gotoWomen(e) {
    wx.navigateTo({
      url: '/pages/women/women'
    });
  },
  gotoBasicInfo(e) {
    wx.navigateTo({
      url: '/pages/basicInfo/basicInfo'
    });
  },
  share(e) {
    // 分享好友逻辑
  },
  contact(e) {
    // 在线客服逻辑
  },
  onShow: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userprofile: app.globalData.userInfo.avatarUrl,
        username: app.globalData.userInfo.nickName
      });
    }
  },
});
