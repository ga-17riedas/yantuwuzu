//获取院校信息，适用于pages\basicInfo的目标院校选择框
// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { skip = 0, limit = 100 } = event;
  try {
    const countResult = await db.collection('yx').count();
    const total = countResult.total;
    const res = await db.collection('yx').skip(skip).limit(limit).get();
    return {
      total: total,
      data: res.data
    };
  } catch (err) {
    return {
      error: err
    };
  }
};
