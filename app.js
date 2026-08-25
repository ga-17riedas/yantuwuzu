const api = require('./utils/api');

App({
  globalData: {
    userInfo: null,
    openid: ''
  },

  onLaunch: function () {
    const cachedUser = wx.getStorageSync('user');
    if (cachedUser) {
      this.globalData.userInfo = cachedUser;
    }

    api.login().then((res) => {
      this.globalData.openid = res.result.openid;
    }).catch((err) => {
      console.error('获取登录身份失败', err);
    });
  },

  onShow: function () {},

  onHide: function () {},

  onError: function (msg) {
    console.error(msg);
  }
});
