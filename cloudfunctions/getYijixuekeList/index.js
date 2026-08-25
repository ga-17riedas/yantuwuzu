// cloudfunctions/getYijixuekeList/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { menlei } = event;
  try {
    const result = await db.collection('zy_more').aggregate()
      .match({
        menlei: menlei
      })
      .group({
        _id: '$yijixueke'
      })
      .end();
    
    console.log('Yijixueke List Result:', result);

    const yijixuekeList = result.list.map(item => item._id);

    return {
      success: true,
      data: yijixuekeList
    };
  } catch (error) {
    console.error('Error getting yijixueke list:', error);
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
