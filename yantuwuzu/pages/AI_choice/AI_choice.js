Page({
  data: {
    rankOptions: ['未选择', '前15%', '前30%', '前50%', '其他'],
    rankIndex: 0,
    major: '',
    region: '',
    schoolList: [],
    report: ''
  },
  onRankChange(e) {
    this.setData({ rankIndex: e.detail.value });
  },
  onInputMajor(e) {
    this.setData({ major: e.detail.value });
  },
  onInputRegion(e) {
    this.setData({ region: e.detail.value });
  },
  onSubmit() {
    const { rankOptions, rankIndex, major, region } = this.data;
    const rank = rankOptions[rankIndex];
    console.log('提交按钮被点击');
    console.log('rank:', rank, 'major:', major, 'region:', region);
    // 调用云函数进行择校推荐
    wx.cloud.callFunction({
      name: 'searchSchools',
      data: { rank, major, region },
      success: (res) => {
        console.log('云函数调用成功:', res);
        if (res.result && res.result.data) {
          console.log('返回的数据:', res.result.data);
          this.setData({ schoolList: res.result.data });
          this.generateReport(res.result.data);
        } else {
          console.error('云函数返回数据为空');
        }
      },
      fail: (err) => {
        console.error('API request failed:', err);
        wx.showToast({
          title: '请求失败，请检查网络或服务器配置',
          icon: 'none'
        });
      }
    });
  },
  generateReport(schoolList) {
    if (!Array.isArray(schoolList)) {
      console.error('schoolList is not an array');
      return;
    }
    let report = '择校报告\n\n';
    schoolList.forEach((school, index) => {
      report += `${index + 1}. 学校名称: ${school.schoolname}\n`;
      report += `专业: ${school.major}\n`;
      report += `研究方向: ${school.direaction}\n`;
      report += `录取人数: ${school.enrollment}\n`;
      report += `考试方式: ${school.exam_style}\n`;
      report += `外语: ${school.language}\n`;
      report += `学习方式: ${school.learn_type}\n`;
      report += `专业编号: ${school.major_num}\n`;
      report += `门类: ${school.menlei}\n`;
      report += `政治: ${school.political}\n`;
      report += `一级学科: ${school.yijixueke}\n\n`;
    });
    console.log('生成的报告:', report);
    this.setData({ report });
  }
});
