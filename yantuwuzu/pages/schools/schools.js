Page({
  data: {
    schools: [],
    currentPage: 1,
    pageSize: 100,
    loading: false,
    addressList: ['地区', '北京', '天津', '上海', '重庆', '内蒙古', '新疆', '西藏', '宁夏', '广西', '香港', '澳门', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '青海', '甘肃'],
    belongList: ['隶属', '教育部', '北京市教育委员会', '工业与信息化部', '中央办公厅', '卫生部', '外交部', '公安部', '国家体育总局', '国家民族事务委员会', '普通', '中国共产主义青年团中央', '中华全国总工会', '天津市教育委员会', '中国民用航空总局', '河北省教育厅', '司法部', '山西省教育厅', '内蒙古自治区教育厅', '辽宁省教育厅', '交通运输部', '上海市教育委员会', '江苏省教育厅', '中国科学院', '国务院侨务办公室', '福建省教育厅', '江西省教育厅', '山东省教育厅', '河南省教育厅', '湖北省教育厅', '中国人民解放军总政治部', '湖南省教育厅', '广东省教育厅', '广西壮族自治区教育厅', '海南省教育厅', '重庆市教育委员会', '四川省教育厅', '贵州省教育厅', '云南省教育厅', '西藏自治区教育厅', '陕西省教育厅', '甘肃省教育厅', '青海省教育厅', '宁夏回族自治区教育厅', '新疆生产建设兵团', '新疆维吾尔自治区教育厅'],
    titleList: ['性质', 211985 , 211 , '普通'],
    selectedAddress: '地区',
    selectedBelong: '隶属',
    selectedTitle: '性质',
    searchQuery: '' // 新增搜索查询
  },
  onReady() {
    wx.setNavigationBarTitle({
      title: '院校库',
    })
  },
  onLoad: function () {
    this.fetchSchools(this.data.currentPage);
  },
  fetchSchools: function (page) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    wx.showLoading({
      title: '加载中，请稍候',
    });
    wx.cloud.callFunction({
      name: 'getschool',
      data: {
        page,
        limit: this.data.pageSize,
        address: this.data.selectedAddress === '地区' ? '' : this.data.selectedAddress,
        belong: this.data.selectedBelong === '隶属' ? '' : this.data.selectedBelong,
        title: this.data.selectedTitle === '性质' ? '' : this.data.selectedTitle,
        searchQuery: this.data.searchQuery // 添加搜索查询
      },
      success: res => {
        wx.hideLoading();
        if (Array.isArray(res.result.data)) {
          const newSchools = res.result.data.filter(item =>
            !this.data.schools.some(existingItem => existingItem._id === item._id)
          );
          if (newSchools.length > 0) {
            this.setData({
              schools: this.data.schools.concat(newSchools),
              currentPage: page + 1,
              loading: false
            });
          } else {
            this.setData({ loading: false });
            wx.showToast({
              title: '没有更多数据了',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },
  onAddressChange: function (e) {
    const selectedAddress = this.data.addressList[e.detail.value];
    this.setData({
      selectedAddress,
      schools: [],
      currentPage: 1,
    });
    this.fetchSchools(1);
  },
  onBelongChange: function (e) {
    const selectedBelong = this.data.belongList[e.detail.value];
    this.setData({
      selectedBelong,
      schools: [],
      currentPage: 1,
    });
    this.fetchSchools(1);
  },
  onTitleChange: function (e) {
    const selectedTitle = this.data.titleList[e.detail.value];
    this.setData({
      selectedTitle,
      schools: [],
      currentPage: 1,
    });
    this.fetchSchools(1);
  },
  onSearchInput: function(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },
  onSearch: function() {
    this.setData({
      schools: [],
      currentPage: 1,
    });
    this.fetchSchools(1);
  },
  onSchoolTap: function (e) {
    const schoolId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schoolDetail/schoolDetail?id=${schoolId}`
    });
  },
  onReachBottom: function () {
    this.fetchSchools(this.data.currentPage);
  }
});
