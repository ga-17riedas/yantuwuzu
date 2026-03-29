Page({
  data: {
    professions: [],
    searchQuery: '',
    pageNum: 1,
    pageSize: 20,
    loadMore: false,
    loadAll: false
  },

  onLoad: function() {
    this.getProfessions();
  },

  onSearchInput: function(e) {
    this.setData({ searchQuery: e.detail.value });
  },

  onSearch: function() {
    this.setData({ pageNum: 1, professions: [] });
    this.getProfessions();
  },

  getProfessions: function(pageNum = 1) {
    wx.showLoading({
      title: '加载中，请稍候',
    });
    this.setData({ loadMore: false });
    wx.cloud.callFunction({
      name: 'getProfessions',
      data: {
        pageNum,
        pageSize: this.data.pageSize,
        searchQuery: this.data.searchQuery
      },
      success: res => {
        console.log('Professions Response:', res);
        if (res.result.success) {
          const newProfessions = res.result.data;
          console.log('Filtered Professions:', newProfessions);
          this.setData({
            professions: pageNum === 1 ? newProfessions : this.data.professions.concat(newProfessions),
            loadMore: newProfessions.length === this.data.pageSize,
            loadAll: newProfessions.length < this.data.pageSize
          });
        } else {
          wx.showToast({ title: '加载专业失败，请重试', icon: 'none' });
        }
        wx.hideLoading(); // 加载完成后隐藏提示
      },
      fail: err => {
        console.error('Error calling getProfessions:', err);
        wx.showToast({ title: '加载专业失败，请重试', icon: 'none' });
        wx.hideLoading(); // 加载失败后隐藏提示
      }
    });
  },

  onReachBottom: function() {
    if (this.data.loadMore && !this.data.loadAll) {
      this.setData({ pageNum: this.data.pageNum + 1 });
      this.getProfessions(this.data.pageNum);
    }
  },

  goToDetail: function(e) {
    const professionName = e.currentTarget.dataset.profession;
    wx.navigateTo({
      url: `/pages/professionDetail/professionDetail?professionName=${professionName}`
    });
  }
});
