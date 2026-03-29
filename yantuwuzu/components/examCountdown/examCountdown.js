// components/examCountdown.js
Component({  
  properties: {  
    // 目标日期，这里设为2024年12月22日  
    targetDate: {  
      type: String,  
      value: '2024-12-22'  
    }  
  },  
  data: {  
    countdown: ''  
  },  
  observers: {  
    // 当目标日期变化时，重新计算倒计时  
    'targetDate': function(newVal) {  
      this.calculateCountdown(newVal);  
    }  
  },  
  methods: {  
    calculateCountdown: function(targetDateStr) {  
      const endDate = new Date(targetDateStr);  
      const now = new Date();  
      if (endDate <= now) {  
        this.setData({  
          countdown: '考试已结束！'  
        });  
        return;  
      }  
  
      const diffTime = endDate - now;  
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));  
      
  
      this.setData({  
        countdown: `${days}天`  
      });  
  
      // 每秒更新一次倒计时  
      setTimeout(() => {  
        this.calculateCountdown(targetDateStr);  
      }, 1000);  
    }  
  },  
  attached: function() {  
    // 组件加载时立即计算倒计时  
    this.calculateCountdown(this.properties.targetDate);  
  }  
});