Page({
  data: {
    rankings: [],
    myRanking: null,
    myScore: null,
    myTime: null,
    indices: Array.from({ length: 20 }, (_, i) => i) // 生成一个包含 20 个元素的数组
  },

  onLoad: function() {
    wx.showLoading({
      title: '加载中，请稍候',
    });
    this.getRankings();
  },

  getRankings: function() {
    wx.cloud.callFunction({
      name: 'getChartData'
    }).then(res => {
      if (res.result.success) {
        console.log('获取到的排行榜数据:', res.result.data); // 打印获取到的数据
        this.setData({
          rankings: res.result.data.map(item => ({
            ...item,
            time: this.formatTime(item.time)
          }))
        });
        this.calculateMyRanking();
      } else {
        console.error('云函数返回错误:', res.result.errorMessage);
      }
    }).catch(err => {
      console.error('调用云函数错误:', err);
    }).finally(() => {
      wx.hideLoading();
    });
  },

  calculateMyRanking: function() {
    const openid = wx.getStorageSync('openid'); // 假设用户的 openid 存储在本地存储中
    const rankings = this.data.rankings;
    const myRankingIndex = rankings.findIndex(item => item.openid === openid);

    if (myRankingIndex !== -1) {
      const myRanking = myRankingIndex + 1;
      const myScore = rankings[myRankingIndex].score;
      const myTime = rankings[myRankingIndex].time;
      this.setData({
        myRanking: myRanking,
        myScore: myScore,
        myTime: myTime
      });
    } else {
      this.setData({
        myRanking: '未上榜',
        myScore: null,
        myTime: null
      });
    }
  },

  formatTime: function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  }
});
