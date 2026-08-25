// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command

  try {
    // 获取 chart 集合中的数据
    const chartRes = await db.collection('chart')
      .orderBy('score', 'desc')
      .orderBy('timestamp', 'asc')
      .get()

    const chartData = chartRes.data

    // 只取每个用户得分最高的一次记录
    const uniqueChartData = []
    const seenOpenIds = new Set()

    for (const item of chartData) {
      if (!seenOpenIds.has(item.openid)) {
        uniqueChartData.push(item)
        seenOpenIds.add(item.openid)
      }
    }

    // 获取所有用户的 openid
    const openids = uniqueChartData.map(item => item.openid)

    // 获取 user 集合中的数据
    const userRes = await db.collection('user')
      .where({
        openid: _.in(openids)
      })
      .get()

    const userData = userRes.data

    // 合并数据
    const mergedData = uniqueChartData.map(chartItem => {
      const userItem = userData.find(user => user.openid === chartItem.openid)
      return {
        ...chartItem,
        nickname: userItem ? userItem.nickname : '',
        avatarUrl: userItem ? userItem.avatar : ''
      }
    })

    return {
      success: true,
      data: mergedData
    }
  } catch (err) {
    return {
      success: false,
      errorMessage: err.message
    }
  }
}
