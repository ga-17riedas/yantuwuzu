// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { majorNum } = event;
  try {
    const res = await db.collection('yx_more').where({ major_num: majorNum }).get();
    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error('Error querying yx_more:', err);
    return {
      success: false,
      errorMessage: '查询附加详情失败'
    };
  }
};
