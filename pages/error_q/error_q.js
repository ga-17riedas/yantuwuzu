const api = require('../../utils/api');

Page({
  data: {
    currentQuestion: {},
    currentQuestionIndex: 0,
    totalQuestions: 0,
    selectedOption: null,
    loggedIn: false,
    openid: ''
  },

  onLoad: function() {
    wx.showLoading({
      title: '获取错题信息中',
    });
    this.checkLoginStatus();
  },

  checkLoginStatus: function() {
    api.login().then(res => {
      const openid = res.result.openid;
      this.setData({
        loggedIn: true,
        openid: openid
      });
      this.loadQuestions(openid);
    }).catch(err => {
      console.error("Failed to get openid:", err);
      this.setData({
        loggedIn: false
      });
      wx.hideLoading();
    });
  },

  loadQuestions: function(openid) {
    api.callFunction({
      name: 'getCuoti',
      data: { openid },
      success: res => {
        const questions = (res.result && res.result.data) || [];
        this.setData({
          totalQuestions: questions.length,
          currentQuestion: questions[0] || {},
          questions: questions
        });
        wx.hideLoading();
      },
      fail: err => {
        console.error("Failed to load questions:", err);
        wx.hideLoading();
      }
    });
  },

  selectOption: function(e) {
    const selectedOption = e.currentTarget.dataset.option;
    this.setData({
      selectedOption: selectedOption
    });
  },

  nextQuestion: function() {
    const { currentQuestion, selectedOption, questions, currentQuestionIndex } = this.data;

    if (selectedOption === currentQuestion.zqda) {
      wx.showToast({
        title: '已刷题通过',
        icon: 'success'
      });
      api.callFunction({
        name: 'removeCuoti',
        data: { id: currentQuestion._id },
        success: () => {
          questions.splice(currentQuestionIndex, 1);
          this.setData({
            totalQuestions: questions.length,
            questions: questions
          });
          if (questions.length === 0) {
            wx.showToast({
              title: '所有题目已刷完',
              icon: 'success'
            });
            return;
          }
        },
        fail: err => {
          console.error("Failed to remove question:", err);
        }
      });
    } else {
      wx.showToast({
        title: '答案错误',
        icon: 'error'
      });
    }

    if (!questions.length) return;
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    this.setData({
      currentQuestionIndex: nextIndex,
      currentQuestion: questions[nextIndex] || {},
      selectedOption: null
    });
  }
});
