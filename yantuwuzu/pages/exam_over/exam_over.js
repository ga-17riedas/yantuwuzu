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
    const db = wx.cloud.database();
    const questions = this.data.questions;

    wx.cloud.callFunction({
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
        console.error("Failed to call cloud function:", err);
      }
    });
  },

  addToCuoti: function(e) {
    const question = e.currentTarget.dataset.question;
    const db = wx.cloud.database();

    wx.showLoading({
      title: '正在加入错题集',
    });

    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        const openid = res.result.openid;

        db.collection('cuoti').add({
          data: {
            openid: openid,
            cttx: question.tx,
            cttg: question.tg,
            ctxx: question.xx,
            zqda: question.zqda
          },
          success: res => {
            wx.hideLoading();
            wx.showToast({
              title: '加入错题集成功',
              icon: 'success'
            });
          },
          fail: err => {
            wx.hideLoading();
            console.error("Failed to add to cuoti:", err);
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error("Failed to get openid:", err);
      }
    });
  },

  viewRankings: function() {
    wx.navigateTo({
      url: '/pages/chart/chart'
    });
  }
});
