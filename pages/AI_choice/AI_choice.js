const api = require('../../utils/api');

Page({
  data: {
    undergradOptions: ['未选择', '985', '211', '双一流', '普通本科'],
    undergradIndex: 0,
    score: '',
    major: '',
    region: '',
    loading: false,
    usedAI: false,
    report: '',
    groups: {
      sprint: [],
      stable: [],
      safe: []
    },
    hasResult: false
  },

  onUndergradChange(e) {
    this.setData({ undergradIndex: e.detail.value });
  },

  onInputScore(e) {
    this.setData({ score: e.detail.value });
  },

  onInputMajor(e) {
    this.setData({ major: e.detail.value });
  },

  onInputRegion(e) {
    this.setData({ region: e.detail.value });
  },

  onSubmit() {
    const { undergradOptions, undergradIndex, score, major, region, loading } = this.data;
    if (loading) return;
    if (!String(major).trim()) {
      wx.showToast({ title: '请先填写目标专业', icon: 'none' });
      return;
    }
    const scoreNum = Number(score);
    if (!Number.isFinite(scoreNum) || scoreNum < 100 || scoreNum > 500) {
      wx.showToast({ title: '请填写 100–500 的模拟分数', icon: 'none' });
      return;
    }

    this.setData({ loading: true, hasResult: false, report: '' });
    wx.showLoading({ title: '正在分析' });

    api.callFunction({
      name: 'aiChoice',
      timeout: 55000,
      data: {
        score: scoreNum,
        undergrad: undergradOptions[undergradIndex],
        major: String(major).trim(),
        region: String(region).trim()
      },
      success: (res) => {
        wx.hideLoading();
        const result = res.result || {};
        if (!result.success) {
          this.setData({ loading: false });
          wx.showToast({ title: result.errorMessage || '分析失败', icon: 'none' });
          return;
        }
        this.setData({
          loading: false,
          hasResult: true,
          usedAI: !!result.usedAI,
          report: result.report || '',
          groups: result.groups || { sprint: [], stable: [], safe: [] }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        wx.showToast({
          title: (err && err.errMsg) || '请求失败，请确认后端已启动',
          icon: 'none'
        });
      }
    });
  }
});
