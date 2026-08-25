//适用于exam_over页面
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { questionIds } = event;
  try {
    const tasks = questionIds.map(id => db.collection('questions').doc(id).get());
    const results = await Promise.all(tasks);
    return {
      success: true,
      data: results.map(res => res.data)
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
