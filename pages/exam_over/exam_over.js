const api = require('../../utils/api');

Page({
  data: {
    score: 0,
    time: 0,
    questions: []
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '结算中，请稍候',
    });
    try {
      const questions = JSON.parse(decodeURIComponent(options.questions));
      this.setData({
        score: options.score,
        time: options.time,
        questions: questions
      });
      this.loadQuestions();
    } catch (e) {
      console.error("Failed to parse questions:", e);
    } finally {
      wx.hideLoading();
    }
  },

  loadQuestions: function() {
    const questions = this.data.questions;

    api.callFunction({
      name: 'getQuestionDetails',
      data: {
        questionIds: questions.map(q => q.id)
      },
      success: res => {
        if (res.result.success) {
          const detailedQuestions = res.result.data.map((question, index) => ({
            ...question,
            userAnswer: questions[index].userAnswer
          }));
          this.setData({
            questions: detailedQuestions
          });
        } else {
          console.error("Failed to get question details:", res.result.errorMessage);
        }
      },
      fail: err => {
        console.error("Failed to call api:", err);
      }
    });
  },

  addToCuoti: function(e) {
    const question = e.currentTarget.dataset.question;

    wx.showLoading({
      title: '正在加入错题集',
    });

    api.callFunction({
      name: 'addCuoti',
      data: {
        openid: wx.getStorageSync('openid'),
        cttx: question.tx,
        cttg: question.tg,
        ctxx: question.xx,
        zqda: question.zqda
      },
      success: res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          wx.showToast({
            title: '加入错题集成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '加入错题集失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error("Failed to add to cuoti:", err);
      }
    });
  },

  viewRankings: function() {
    wx.navigateTo({
      url: '/pages/chart/chart'
    });
  }
});
