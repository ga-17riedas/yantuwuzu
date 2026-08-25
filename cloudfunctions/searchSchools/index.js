// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { rank, major, region } = event;
  try {
    const res = await db.collection('zy_more').where({
      major: db.RegExp({
        regexp: major,
        options: 'i'
      }),
      region: db.RegExp({
        regexp: region,
        options: 'i'
      })
    }).get();
    console.log('查询结果:', res.data);
    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      error: err
    };
  }
};
