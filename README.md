一、项目概述
本项目是基于微信云开发的考研小程序，功能包括院校查询，专业查询，题库刷题，模拟考试，错题重刷，成绩和时间排行榜。软件架构是微信原生小程序+云开发。



二、页面结构
tabBar页
首页 pages/index/index
信息库页 pages/inquiry/inquiry
题库首页 pages/question_index/question_index
个人中心页 pages/logs/logs
非tabBar页
院校库页 pages/schools/schools
专业库页 pages/professions/professions

题库答题页 pages/question/question

热门院校页 pages/hot_school/hot_school

AI择校页 pages/AI_choice/AI_choice

错题集页 pages/error_q/error_q

个人基本信息页 pages/basicInfo/basicInfo

排行榜页 pages/chart/chart

模拟考试页 pages/exam/exam

模拟考试说明页 pages/exam_begin/exam_begin

模拟考试结算页 pages/exam_over/exam_over

使用说明页 pages/shuoming/shuoming

关于我们页 pages/women/women

院校详细页 pages/schoolDetail/schoolDetail

专业详细页 pages/professionDetail/professionDetail

 三、功能结构
实现页面间跳转功能
微信授权登录
考研时间倒计时
获取微信头像和昵称等
实现院校和专业动态数据绑定
实现用云开发实现查询院校功能
实现用云开发实现查询专业功能
实现用云开发实现查询院校详细功能
实现用云开发实现查询专业详细功能
题库随机抽题算法
支持单选（判断，多选可加）
实现用云开发实现查询题库功能
实现动态题目数据绑定
答题交互逻辑
切换下一题
模拟考试答题进度显示
提交答卷保存到云数据库集合
系统自动判分
模拟考试结算页从云数据库查询答题成绩
模拟考试错题加入错题集功能
错题集重做和自动判误功能
查询排行榜成绩
取最佳成绩进行排名
推荐分享
在线客服
基本信息修改
