// cloudfunctions/getProfessions/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { pageNum, pageSize, searchQuery } = event;
  const collection = db.collection('zy');
  const moreCollection = db.collection('zy_more');

  try {
    let query = {};
    if (searchQuery) {
      query = db.command.or([
        { profession_name: db.RegExp({ regexp: searchQuery, options: 'i' }) },
        { menlei: db.RegExp({ regexp: searchQuery, options: 'i' }) },
        { yijixueke: db.RegExp({ regexp: searchQuery, options: 'i' }) },
        { major_number: db.RegExp({ regexp: searchQuery, options: 'i' }) },
        { profession_type: db.RegExp({ regexp: searchQuery, options: 'i' }) }
      ]);
    }

    console.log('Query:', query);

    const result = await collection
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .where(query)
      .get();

    console.log('Professions Result:', result);

    const professions = result.data;

    if (professions.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const professionNames = professions.map(item => item.profession_name);
    const moreResult = await moreCollection.where({
      profession_name: db.command.in(professionNames)
    }).get();

    console.log('More Professions Result:', moreResult);

    const moreData = moreResult.data;

    const finalData = professions.map(profession => {
      const moreInfo = moreData.find(item => item.profession_name === profession.profession_name) || {};
      return {
        ...profession,
        major_number: moreInfo.major_num || '',
        menlei: moreInfo.menlei || '',
        yijixueke: moreInfo.yijixueke || ''
      };
    });

    console.log('Final Data:', finalData);

    return {
      success: true,
      data: finalData
    };
  } catch (error) {
    console.error('Error getting professions:', error);
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
