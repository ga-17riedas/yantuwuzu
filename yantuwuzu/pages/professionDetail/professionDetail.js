Page({
  data: {
    profession: {},
    schools: [],
    loading: true // 添加 loading 状态
  },

  onLoad: function(options) {
    const professionName = options.professionName;
    this.getProfessionDetail(professionName);
  },

  getProfessionDetail: function(professionName) {
    wx.showLoading({
      title: '加载中，请稍候',
    });
    wx.cloud.callFunction({
      name: 'getProfessionDetail',
      data: { professionName },
      success: res => {
        console.log('Profession Detail Response:', res);
        if (res.result.success) {
          const profession = res.result.data.profession;
          const schools = res.result.data.schools;
          this.setData({ profession });
          this.getAdditionalDetails(profession.major_num, schools);
        } else {
          wx.showToast({ title: '加载详情失败，请重试', icon: 'none' });
          wx.hideLoading(); // 加载失败时隐藏提示
        }
      },
      fail: err => {
        console.error('Error calling getProfessionDetail:', err);
        wx.showToast({ title: '加载详情失败，请重试', icon: 'none' });
        wx.hideLoading(); // 加载失败时隐藏提示
      }
    });
  },

  getAdditionalDetails: function(majorNum, schools) {
    wx.cloud.callFunction({
      name: 'getAdditionalDetails',
      data: { majorNum },
      success: res => {
        console.log('Additional Details Response:', res);
        if (res.result.success) {
          const additionalDetails = res.result.data;
          const updatedSchools = schools.map(school => {
            const details = additionalDetails.find(detail => detail.major_num === majorNum);
            return {
              ...school,
              exam_style: details.exam_style,
              learn_type: details.learn_type,
              language: details.language,
              political: details.political,
              enrollment: details.enrollment,
              class1: details.class1,
              class2: details.class2
            };
          });
          this.setData({ schools: updatedSchools, loading: false }); // 加载成功时隐藏提示
          wx.hideLoading(); // 加载成功时隐藏提示
        } else {
          wx.showToast({ title: '加载附加详情失败，请重试', icon: 'none' });
          wx.hideLoading(); // 加载失败时隐藏提示
        }
      },
      fail: err => {
        console.error('Error calling getAdditionalDetails:', err);
        wx.showToast({ title: '加载附加详情失败，请重试', icon: 'none' });
        wx.hideLoading(); // 加载失败时隐藏提示
      }
    });
  }
});
