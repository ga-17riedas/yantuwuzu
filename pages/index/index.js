const api = require('../../utils/api');

function greetingText() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function daysToExam() {
  const end = new Date('2026/12/26');
  const now = new Date();
  if (end <= now) return 0;
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

const NOTICE_ITEMS = [
  '本小程序仅作开发使用，实际考研信息并非真实数据',
  '本小程序为学习辅助工具，非官方招生平台，不提供报名与缴费',
  '院校、专业与录取相关数据仅供参考，最终以各高校研究生招生网公布为准',
  'AI 择校按模拟分数和院校库估算，不构成录取承诺',
  '模拟考试成绩只用于练习和排名，与真实考研成绩无关'
];

Page({
  data: {
    greeting: greetingText(),
    days: daysToExam(),
    keyword: '',
    hotSchools: [],
    notices: NOTICE_ITEMS.map((text, index) => ({
      id: index,
      text,
      duration: Math.max(14, Math.round(text.length * 0.42))
    }))
  },

  onLoad() {
    this.loadHotSchools();
  },

  onShow() {
    this.setData({ greeting: greetingText() });
  },

  onPullDownRefresh() {
    this.loadHotSchools();
    wx.stopPullDownRefresh();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  searcher() {
    this.openPage('/pages/schools/schools');
  },

  goHot() {
    this.openPage('/pages/hot_school/hot_school');
  },

  goExam() {
    this.openPage('/pages/exam_begin/exam_begin');
  },

  goAI() {
    this.openPage('/pages/AI_choice/AI_choice');
  },

  goNotice() {
    this.openPage('/pages/shuoming/shuoming');
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.showToast({ title: '页面打开失败', icon: 'none' });
      }
    });
  },

  loadHotSchools() {
    api.callFunction({
      name: 'loadSchools',
      success: (res) => {
        const list = (res.result && res.result.data) || [];
        this.setData({ hotSchools: list.slice(0, 8) });
      }
    });
  }
});
