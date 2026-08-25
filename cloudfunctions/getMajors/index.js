//适用于pages\schoolDetail分页栏开设相关专业处
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { schoolname, page = 1, pageSize = 20, searchQuery = '' } = event; // 添加分页参数和搜索查询
  const db = cloud.database();
  const _ = db.command;
  
  console.log(`Fetching majors for school: ${schoolname}, page: ${page}, pageSize: ${pageSize}, searchQuery: ${searchQuery}`); // 添加日志记录

  try {
    const query = {
      schoolname: _.eq(schoolname)
    };
    if (searchQuery) {
      query.major = db.RegExp({
        regexp: searchQuery,
        options: 'i'
      });
    }

    const res = await db.collection('yx_more').where(query)
      .skip((page - 1) * pageSize) // 跳过前面的记录
      .limit(pageSize) // 限制返回的记录数量
      .get();
    
    console.log(`Query successful: ${res.data.length} records found`); // 添加日志记录
    console.log('Query result:', res.data); // 添加日志记录
    return {
      data: res.data
    };
  } catch (err) {
    console.error(`Query failed: ${err}`); // 添加日志记录
    return {
      error: err
    };
  }
};
