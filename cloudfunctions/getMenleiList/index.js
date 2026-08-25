// cloudfunctions/getMenleiList/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const result = await db.collection('zy_more').aggregate()
      .group({
        _id: '$menlei'
      })
      .end();
    
    console.log('Menlei List Result:', result);

    const menleiList = result.list.map(item => item._id);

    return {
      success: true,
      data: menleiList
    };
  } catch (error) {
    console.error('Error getting menlei list:', error);
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
