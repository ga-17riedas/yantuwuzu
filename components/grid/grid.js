// components/grid/grid.js
Component({  
  properties: {}, // 定义组件的属性 
  data: {
    gridItems: [{
        imgUrl: "/images/index_grid/院校.png",
        url: '/pages/schools/schools',
        text: '找院校'
      },
      {
        imgUrl: "/images/index_grid/专业.png",
        url: '/pages/professions/professions',
        text: '找专业'
      },
      {
        imgUrl: "/images/index_grid/习题.png",
        url: '/pages/question/question',
        text: '刷题'
      },
      {
        imgUrl : "/images/index_grid/咨讯.png",
        url : '/pages/hot_school/hot_school',
        text:'热门院校'
      },
      {
        imgUrl : "/images/index_grid/ai.png",
        url : '/pages/AI_choice/AI_choice',
        text:'AI择校'
      },
      {
        imgUrl : "/images/index_grid/错题.png",
        url : '/pages/error_q/error_q',
        text:'看错题'
    }
        

    ]
  },
  methods: {  
    gridTap(event) {
      const index = event.currentTarget.dataset.index;
      const url = this.data.gridItems[index] && this.data.gridItems[index].url;
      if (!url) return;
      wx.navigateTo({
        url,
        fail: () => {
          wx.showToast({ title: '页面打开失败', icon: 'none' });
        }
      });
    }  
  }  
})