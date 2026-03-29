// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command

  try {
    const countResult = await db.collection('questions').count()
    const total = countResult.total
    const randomIndexes = Array.from({ length: 20 }, () => Math.floor(Math.random() * total))

    const tasks = randomIndexes.map(index => {
      return db.collection('questions').skip(index).limit(1).get()
    })

    const results = await Promise.all(tasks)
    const questions = results.map(result => result.data[0])

    return {
      success: true,
      data: questions
    }
  } catch (err) {
    return {
      success: false,
      errorMessage: err.message
    }
  }
}
