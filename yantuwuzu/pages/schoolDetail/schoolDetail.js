Page({
  data: {
    school: {},
    currentTab: 'jianjie',
    majors: [], // 新增字段用于存储专业信息
    page: 1, // 当前页码
    pageSize: 20, // 每页记录数
    hasMore: true, // 是否还有更多数据
    searchQuery: '' // 搜索查询
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中，请稍候',
    });
    const schoolId = options.id;
    this.fetchSchoolDetail(schoolId);
    this.fetchMajors(schoolId); // 新增调用函数
  },
  fetchSchoolDetail: function(id) {
    wx.cloud.callFunction({
      name: 'getschoolDetail',
      data: { id },
      success: res => {
        if (res.result.data) {
          this.setData({
            school: res.result.data
          });
        } else {
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  fetchMajors: function(schoolname) {
    if (!this.data.hasMore) return; // 如果没有更多数据，则不再加载
    console.log('Fetching majors for school:', schoolname, 'page:', this.data.page, 'pageSize:', this.data.pageSize, 'searchQuery:', this.data.searchQuery); // 添加日志
    wx.cloud.callFunction({
      name: 'getMajors',
      data: { schoolname, page: this.data.page, pageSize: this.data.pageSize, searchQuery: this.data.searchQuery },
      success: res => {
        console.log('Majors data:', res.result.data); // 添加日志
        if (res.result.data.length > 0) {
          this.setData({
            majors: this.data.majors.concat(res.result.data), // 追加新数据
            page: this.data.page + 1 // 页码加1
          });
        } else {
          this.setData({
            hasMore: false // 没有更多数据
          });
        }
        console.log('Majors set to data:', this.data.majors); // 添加日志
      },
      fail: err => {
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    if (tab === 'zhaosheng') {
      this.setData({
        page: 1, // 重置页码
        hasMore: true, // 重置是否有更多数据
        majors: [] // 清空已有数据
      });
      this.fetchMajors(this.data.school.schoolname); // 切换到招生专业时加载数据
    }
  },
  onReachBottom: function() {
    // 当页面滚动到底部时，加载更多数据
    if (this.data.currentTab === 'zhaosheng') {
      this.fetchMajors(this.data.school.schoolname);
    }
  },
  onSearchInput: function(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },
  onSearch: function() {
    this.setData({
      page: 1, // 重置页码
      hasMore: true, // 重置是否有更多数据
      majors: [] // 清空已有数据
    });
    this.fetchMajors(this.data.school.schoolname); // 执行搜索
  }
});
