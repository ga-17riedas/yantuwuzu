// pages/basicInfo/basicInfo.js
Page({
  data: {
    userInfo: {}, // 初始化为空对象，以便从本地存储加载数据
    grades: ['大一', '大二', '大三', '大四'],
    gradeIndex: 0,
    schools: [],
    filteredSchools: [],
    schoolIndex: 0
  },
  onLoad: function(options) {
    // 从本地存储加载userInfo数据
    const userInfo = wx.getStorageSync('userInfo') || {}; // 如果没有数据，则使用空对象
    this.setData({
      userInfo: userInfo,
      gradeIndex: this.data.grades.indexOf(userInfo.grade) // 设置年级选择器的初始值
    });
    // 加载目标院校数据
    this.loadSchools();
  },
  loadSchools: function() {
    const MAX_LIMIT = 100;
    wx.cloud.callFunction({
      name: 'getschool_2',
      data: {
        limit: MAX_LIMIT
      }
    }).then(res => {
      const total = res.result.total;
      const batchTimes = Math.ceil(total / MAX_LIMIT);
      const tasks = [];

      for (let i = 0; i < batchTimes; i++) {
        const promise = wx.cloud.callFunction({
          name: 'getschool_2',
          data: {
            skip: i * MAX_LIMIT,
            limit: MAX_LIMIT
          }
        });
        tasks.push(promise);
      }

      Promise.all(tasks).then(results => {
        const allSchools = results.reduce((acc, cur) => {
          return acc.concat(cur.result.data);
        }, []);
        this.setData({
          schools: allSchools,
          filteredSchools: allSchools // 初始化过滤后的学校列表
        });
      }).catch(err => {
        console.error('加载学校数据失败:', err); // 错误处理
      });
    }).catch(err => {
      console.error('获取学校总数失败:', err); // 错误处理
    });
  },
  bindGradeChange: function(e) {
    this.setData({
      gradeIndex: e.detail.value,
      'userInfo.grade': this.data.grades[e.detail.value]
    });
    wx.setStorageSync('userInfo', this.data.userInfo);
  },
  bindSchoolChange: function(e) {
    this.setData({
      schoolIndex: e.detail.value,
      'userInfo.targetSchool': this.data.filteredSchools[e.detail.value].schoolname
    });
    wx.setStorageSync('userInfo', this.data.userInfo);
  },
  onSearchInput: function(e) {
    const query = e.detail.value.toLowerCase();
    const filteredSchools = this.data.schools.filter(school => school.schoolname.toLowerCase().includes(query));
    this.setData({
      filteredSchools: filteredSchools,
      schoolIndex: 0 // 重置选择框的索引
    });
  },
  saveField: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    // 更新userInfo对象，并保存到本地存储
    this.setData({
      [`userInfo.${field}`]: value
    });
    // 更新本地存储中的userInfo
    let userInfo = {...this.data.userInfo}; // 浅拷贝，避免直接修改引用
    wx.setStorageSync('userInfo', userInfo);
  },
  saveAllInfo: function() {
    // 这里可以添加将userInfo数据保存到数据库或服务器的逻辑
    // 但由于我们已经在saveField中保存了数据，这里只需要打印或进行其他操作
    console.log('Saving all info:', this.data.userInfo);
    // 如果需要，也可以在这里再次调用wx.setStorageSync来确保数据是最新的
  }
});
