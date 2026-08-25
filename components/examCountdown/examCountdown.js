Component({
  properties: {
    targetDate: {
      type: String,
      value: '2026-12-26'
    }
  },
  data: {
    countdown: '--',
    label: '距离2027年全国硕士研究生招生考试',
    ended: false
  },
  observers: {
    targetDate: function (newVal) {
      this.calculateCountdown(newVal);
    }
  },
  methods: {
    calculateCountdown: function (targetDateStr) {
      const endDate = new Date(targetDateStr.replace(/-/g, '/'));
      const now = new Date();
      if (endDate <= now) {
        this.setData({
          countdown: '考试已结束',
          label: '下一届考研信息即将更新',
          ended: true
        });
        return;
      }
      const days = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      this.setData({
        countdown: String(days),
        ended: false
      });
    }
  },
  attached: function () {
    this.calculateCountdown(this.properties.targetDate);
  }
});
