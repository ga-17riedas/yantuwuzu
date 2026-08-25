// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { nickname, avatar, openid } = event

  try {
    const res = await db.collection('user').add({
      data: {
        nickname: nickname,
        avatar: avatar,
        openid: openid,
        timestamp: new Date()
      }
    })
    return {
      success: true,
      data: res
    }
  } catch (err) {
    return {
      success: false,
      errorMessage: err.message
    }
  }
}
