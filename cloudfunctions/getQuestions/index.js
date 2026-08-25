//获取questions数据集合中的题目数据，适用于question页面
// cloudfunctions/getQuestions/index.js
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  const db = cloud.database()
  const questionsCollection = db.collection('questions') // 替换为你的集合名称

  try {
    const res = await questionsCollection.get()
    return {
      success: true,
      data: res.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
