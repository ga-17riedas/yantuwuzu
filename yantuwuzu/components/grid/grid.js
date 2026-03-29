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
        text: '找习题'
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
      // 处理点击事件  
      const index = event.currentTarget.dataset.index;  
       
  
      // 假设你想导航到其他页面  
      wx.navigateTo({  
        url: this.data.gridItems[index].url
      });  
    }  
  }  
})