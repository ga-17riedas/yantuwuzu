// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { score, incorrectQuestions, time } = event
  const { OPENID } = cloud.getWXContext()

  try {
    await db.collection('chart').add({
      data: {
        openid: OPENID,
        score: score,
        incorrectQuestions: incorrectQuestions,
        time: time // 存储总用时
      }
    })
    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      errorMessage: err.message
    }
  }
}
