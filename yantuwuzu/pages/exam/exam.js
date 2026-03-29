Page({
  data: {
    questions: [],
    currentQuestionIndex: 0,
    selectedOptions: [],
    score: 0,
    remainingTime: 1800, // 初始剩余时间为30分钟
    intervalId: null,
    incorrectQuestions: [],
    showNavigation: false,
    minutes: '30',
    seconds: '00',
    startTime: null // 添加开始时间字段
  },

  onLoad: function() {
    wx.showLoading({
      title: '抽题中，请稍候',
    });
    this.loadRandomQuestions();
    this.startTimer(); // 在页面加载时启动计时器
    this.setData({
      startTime: Date.now() // 记录开始时间
    });
  },

  loadRandomQuestions: function() {
    wx.cloud.callFunction({
      name: 'getRandomQuestions',
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          this.setData({
            questions: res.result.data.map((question, index) => ({
              ...question,
              number: index + 1
            })),
            currentQuestionIndex: 0,
            selectedOptions: Array(20).fill(null),
            score: 0,
            remainingTime: 1800, // 重置剩余时间
            incorrectQuestions: []
          });
        } else {
          console.error("Failed to get questions:", res.result.errorMessage);
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error("Failed to call cloud function:", err);
      }
    });
  },

  startTimer: function() {
    const intervalId = setInterval(() => {
      let { remainingTime } = this.data;
      if (remainingTime > 0) {
        remainingTime--;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        this.setData({
          remainingTime,
          minutes: this.formatTime(minutes),
          seconds: this.formatTime(seconds)
        });
      } else {
        clearInterval(intervalId);
        this.submitExam();
      }
    }, 1000);
    this.setData({
      intervalId: intervalId
    });
  },

  formatTime: function(time) {
    return time < 10 ? `0${time}` : time;
  },

  selectOption: function(e) {
    const selectedOption = e.currentTarget.dataset.option;
    const { currentQuestionIndex, questions, selectedOptions, score, incorrectQuestions } = this.data;
    const correctAnswer = questions[currentQuestionIndex].zqda;

    selectedOptions[currentQuestionIndex] = selectedOption;
    if (selectedOption === correctAnswer) {
      this.setData({
        score: score + parseInt(questions[currentQuestionIndex].score)
      });
    } else {
      incorrectQuestions.push({
        id: questions[currentQuestionIndex]._id,
        userAnswer: selectedOption
      });
    }

    this.setData({
      selectedOptions: selectedOptions,
      incorrectQuestions: incorrectQuestions
    });

    if (currentQuestionIndex < questions.length - 1) {
      this.setData({
        currentQuestionIndex: currentQuestionIndex + 1
      });
    }
  },

  navigateToQuestion: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentQuestionIndex: index
    });
  },

  toggleNavigation: function() {
    this.setData({
      showNavigation: !this.data.showNavigation
    });
  },

  submitExam: function() {
    const { selectedOptions, startTime, questions } = this.data;
    if (selectedOptions.includes(null)) {
      wx.showModal({
        title: '提示',
        content: '未做完不可交卷',
        showCancel: false
      });
      return;
    }

    clearInterval(this.data.intervalId);

    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000); // 计算总用时，单位为秒

    const allQuestions = questions.map((question, index) => ({
      id: question._id,
      userAnswer: selectedOptions[index]
    }));

    wx.cloud.callFunction({
      name: 'submitScore',
      data: {
        score: this.data.score,
        incorrectQuestions: this.data.incorrectQuestions,
        time: totalTime // 传递总用时
      },
      success: res => {
        if (res.result.success) {
          wx.navigateTo({
            url: '/pages/exam_over/exam_over?score=' + this.data.score + '&questions=' + encodeURIComponent(JSON.stringify(allQuestions)) + '&time=' + totalTime
          });
        } else {
          console.error("Failed to submit score:", res.result.errorMessage);
        }
      },
      fail: err => {
        console.error("Failed to submit score:", err);
      }
    });
  }
});
