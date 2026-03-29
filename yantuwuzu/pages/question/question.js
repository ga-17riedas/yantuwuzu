Page({
  data: {
    questions: [],
    currentQuestionIndex: 0,
    isCorrect: null,
    userAnswer: null,
    correctAnswer: null,
    selectedOption: null
  },

  onLoad: function () {
    wx.showLoading({
      title: '获取题目信息中',
    });
    this.getQuestions();
  },

  getQuestions: function () {
    wx.cloud.callFunction({
      name: 'getQuestions',
      success: res => {
        if (res.result.success) {
          const questions = res.result.data.map((question, index) => ({
            ...question,
            index: index + 1
          }));
          this.setData({
            questions: questions,
            currentQuestion: questions[0]
          });
        } else {
          console.error('获取问题失败:', res.result.error);
        }
        wx.hideLoading();
      },
      fail: err => {
        console.error('调用云函数失败:', err);
        wx.hideLoading();
      }
    });
  },

  selectOption: function (e) {
    const selectedOption = e.currentTarget.dataset.option;
    const isCorrect = selectedOption === this.data.currentQuestion.zqda;
    this.setData({
      isCorrect: isCorrect,
      userAnswer: selectedOption,
      correctAnswer: this.data.currentQuestion.zqda,
      selectedOption: selectedOption
    });
  },

  nextQuestion: function () {
    const nextIndex = this.data.currentQuestionIndex + 1;
    if (nextIndex < this.data.questions.length) {
      this.setData({
        currentQuestionIndex: nextIndex,
        currentQuestion: this.data.questions[nextIndex],
        isCorrect: null,
        userAnswer: null,
        correctAnswer: null,
        selectedOption: null
      });
    } else {
      wx.showToast({
        title: '已是最后一题',
        icon: 'none'
      });
    }
  }
});
