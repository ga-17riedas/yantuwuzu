const api = require('../../utils/api');

Page({
  data: {
    school: {},
    currentTab: 'jianjie',
    majors: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    searchQuery: ''
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中，请稍候',
    });
    const schoolId = options.id;
    this.fetchSchoolDetail(schoolId);
  },
  fetchSchoolDetail: function(id) {
    api.callFunction({
      name: 'getschoolDetail',
      data: { id },
      success: res => {
        if (res.result.data) {
          this.setData({
            school: res.result.data
          });
          this.fetchMajors(res.result.data.schoolname);
        } else {
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '接口调用失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  fetchMajors: function(schoolname) {
    if (!this.data.hasMore) return;
    api.callFunction({
      name: 'getMajors',
      data: { schoolname, page: this.data.page, pageSize: this.data.pageSize, searchQuery: this.data.searchQuery },
      success: res => {
        const list = (res.result && res.result.data) || [];
        if (list.length > 0) {
          this.setData({
            majors: this.data.majors.concat(list),
            page: this.data.page + 1
          });
        } else {
          this.setData({
            hasMore: false
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '接口调用失败',
          icon: 'none'
        });
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
        page: 1,
        hasMore: true,
        majors: []
      });
      this.fetchMajors(this.data.school.schoolname);
    }
  },
  onReachBottom: function() {
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
      page: 1,
      hasMore: true,
      majors: []
    });
    this.fetchMajors(this.data.school.schoolname);
  }
});
