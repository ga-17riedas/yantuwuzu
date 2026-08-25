//获取院校详细信息，适用于pages\schoolDetail
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { id } = event

  try {
    const res = await db.collection('yx').doc(id).get()
    return {
      errCode: 0,
      errMsg: 'success',
      data: res.data
    }
  } catch (error) {
    console.error('Catch error:', error)
    return {
      errCode: -2,
      errMsg: 'Failed to fetch data from database',
      data: null
    }
  }
}
