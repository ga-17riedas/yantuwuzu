// cloudfunctions/getProfessionDetail/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { professionName } = event;
  const collection = db.collection('zy');
  const moreCollection = db.collection('zy_more');

  try {
    const professionResult = await collection.where({ profession_name: professionName }).get();
    const moreResult = await moreCollection.where({ profession_name: professionName }).get();

    if (professionResult.data.length === 0 || moreResult.data.length === 0) {
      return {
        success: false,
        errorMessage: '未找到相关专业信息'
      };
    }

    const professionData = professionResult.data[0];
    const schoolsData = moreResult.data.map(item => ({
      schoolname: item.schoolname,
      direaction: item.direaction,
      major_num: item.major_num,
      menlei: item.menlei,
      yijixueke: item.yijixueke
    }));

    const finalData = {
      profession: {
        profession_name: professionData.profession_name,
        profession_type: professionData.profession_type,
        major_num: schoolsData[0].major_num,
        menlei: schoolsData[0].menlei,
        yijixueke: schoolsData[0].yijixueke
      },
      schools: schoolsData
    };

    return {
      success: true,
      data: finalData
    };
  } catch (error) {
    console.error('Error getting profession detail:', error);
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
