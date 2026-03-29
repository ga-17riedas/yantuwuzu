//获取院校信息，适用于schools页面
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { page = 1, limit = 100, address, belong, title, searchQuery = '' } = event // 默认每页100条数据
  const query = {}
  if (address) query.schooladdress = address
  if (belong) query.belong = belong
  if (title) query.title = title
  if (searchQuery) {
    query.schoolname = db.RegExp({
      regexp: searchQuery,
      options: 'i'
    });
  }

  try {
    const res = await db.collection('yx').where(query).skip((page - 1) * limit).limit(limit).get()
    if (res.errMsg !== 'collection.get:ok') {
      return {
        errCode: -1,
        errMsg: res.errMsg,
        data: null
      }
    }
    return {
      errCode: 0,
      errMsg: 'success',
      data: res.data
    }
  } catch (error) {
    return {
      errCode: -2,
      errMsg: 'Failed to fetch data from database',
      data: null
    }
  }
}
