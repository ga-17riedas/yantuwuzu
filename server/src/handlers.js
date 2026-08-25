const crypto = require('crypto');
const config = require('./config');
const { getDb, mapQuestion, mapCuoti, mapChart } = require('./db');
const { signToken } = require('./middleware/auth');
const deepseek = require('./deepseek');

function like(value) {
  return `%${String(value).toLowerCase()}%`;
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function code2Session(code) {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(config.wechatAppId)}&secret=${encodeURIComponent(config.wechatAppSecret)}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
  const response = await fetch(url);
  return response.json();
}

async function login(event, ctx) {
  let openid = ctx.openid || event.openid || '';

  if (config.wechatAppSecret && event.code) {
    try {
      const session = await code2Session(event.code);
      if (session.openid) {
        openid = session.openid;
      } else {
        console.warn('微信登录失败，回退本地身份:', session);
      }
    } catch (err) {
      console.warn('微信登录请求失败，回退本地身份:', err.message);
    }
  }

  if (!openid) {
    openid = `local_${crypto.createHash('md5').update(config.jwtSecret).digest('hex').slice(0, 16)}`;
  }

  return {
    openid,
    token: signToken(openid)
  };
}

function getschool(event) {
  const db = getDb();
  const page = Number(event.page) || 1;
  const limit = Number(event.limit) || 100;
  const address = event.address || '';
  const belong = event.belong || '';
  const title = event.title == null || event.title === '' ? '' : String(event.title);
  const searchQuery = event.searchQuery || '';

  const where = [];
  const params = [];
  if (address) {
    where.push('schooladdress = ?');
    params.push(address);
  }
  if (belong) {
    where.push('belong = ?');
    params.push(belong);
  }
  if (title) {
    where.push('CAST(title AS TEXT) = ?');
    params.push(title);
  }
  if (searchQuery) {
    where.push('LOWER(schoolname) LIKE ?');
    params.push(like(searchQuery));
  }

  const sql = `
    SELECT * FROM yx
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(sql).all(...params, limit, (page - 1) * limit);
  return { errCode: 0, errMsg: 'success', data: rows };
}

function getschoolDetail(event) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM yx WHERE _id = ?').get(event.id);
  if (!row) {
    return { errCode: -2, errMsg: 'Failed to fetch data from database', data: null };
  }
  return { errCode: 0, errMsg: 'success', data: row };
}

function getschool_2(event) {
  const db = getDb();
  const skip = Number(event.skip) || 0;
  const limit = Number(event.limit) || 100;
  const total = db.prepare('SELECT COUNT(*) AS c FROM yx').get().c;
  const data = db.prepare('SELECT * FROM yx LIMIT ? OFFSET ?').all(limit, skip);
  return { total, data };
}

function getProfessions(event) {
  const db = getDb();
  const pageNum = Number(event.pageNum) || 1;
  const pageSize = Number(event.pageSize) || 20;
  const searchQuery = event.searchQuery || '';

  let professions;
  if (searchQuery) {
    const keyword = like(searchQuery);
    professions = db.prepare(`
      SELECT zy.* FROM zy
      LEFT JOIN zy_more ON zy.profession_name = zy_more.profession_name
      WHERE LOWER(zy.profession_name) LIKE ?
         OR LOWER(IFNULL(zy_more.menlei, '')) LIKE ?
         OR LOWER(IFNULL(zy_more.yijixueke, '')) LIKE ?
         OR LOWER(IFNULL(zy_more.major_num, '')) LIKE ?
         OR LOWER(zy.profession_type) LIKE ?
      GROUP BY zy._id
      LIMIT ? OFFSET ?
    `).all(keyword, keyword, keyword, keyword, keyword, pageSize, (pageNum - 1) * pageSize);
  } else {
    professions = db.prepare('SELECT * FROM zy LIMIT ? OFFSET ?').all(pageSize, (pageNum - 1) * pageSize);
  }

  if (!professions.length) {
    return { success: true, data: [] };
  }

  const names = professions.map((item) => item.profession_name);
  const placeholders = names.map(() => '?').join(',');
  const moreRows = db.prepare(`SELECT * FROM zy_more WHERE profession_name IN (${placeholders})`).all(...names);

  const data = professions.map((profession) => {
    const moreInfo = moreRows.find((item) => item.profession_name === profession.profession_name) || {};
    return {
      ...profession,
      major_number: moreInfo.major_num || '',
      menlei: moreInfo.menlei || '',
      yijixueke: moreInfo.yijixueke || ''
    };
  });

  return { success: true, data };
}

function getProfessionDetail(event) {
  const db = getDb();
  const professionName = event.professionName;
  const profession = db.prepare('SELECT * FROM zy WHERE profession_name = ? LIMIT 1').get(professionName);
  const moreRows = db.prepare('SELECT * FROM zy_more WHERE profession_name = ?').all(professionName);

  if (!profession || !moreRows.length) {
    return { success: false, errorMessage: '未找到相关专业信息' };
  }

  return {
    success: true,
    data: {
      profession: {
        profession_name: profession.profession_name,
        profession_type: profession.profession_type,
        major_num: moreRows[0].major_num,
        menlei: moreRows[0].menlei,
        yijixueke: moreRows[0].yijixueke
      },
      schools: moreRows.map((item) => ({
        schoolname: item.schoolname,
        direaction: item.direaction,
        major_num: item.major_num,
        menlei: item.menlei,
        yijixueke: item.yijixueke
      }))
    }
  };
}

function getQuestions() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM questions').all().map(mapQuestion);
  return { success: true, data: rows };
}

function getRandomQuestions() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 20').all().map(mapQuestion);
  return { success: true, data: rows };
}

function submitScore(event, ctx) {
  const db = getDb();
  const openid = ctx.openid;
  if (!openid) {
    return { success: false, errorMessage: '未登录' };
  }
  db.prepare(`
    INSERT INTO chart (_id, openid, score, incorrectQuestions, time, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    newId('chart'),
    openid,
    Number(event.score) || 0,
    JSON.stringify(event.incorrectQuestions || []),
    Number(event.time) || 0,
    Date.now()
  );
  return { success: true };
}

function uploadUserInfo(event, ctx) {
  const db = getDb();
  const openid = event.openid || ctx.openid;
  if (!openid) {
    return { success: false, errorMessage: '缺少 openid' };
  }
  const existing = db.prepare('SELECT _id FROM users WHERE openid = ?').get(openid);
  if (existing) {
    db.prepare('UPDATE users SET nickname = ?, avatar = ?, timestamp = ? WHERE openid = ?').run(
      event.nickname || '',
      event.avatar || '',
      Date.now(),
      openid
    );
  } else {
    db.prepare('INSERT INTO users (_id, openid, nickname, avatar, timestamp) VALUES (?, ?, ?, ?, ?)').run(
      newId('user'),
      openid,
      event.nickname || '',
      event.avatar || '',
      Date.now()
    );
  }
  return { success: true, data: { openid } };
}

function getChartData() {
  const db = getDb();
  const chartRows = db.prepare('SELECT * FROM chart ORDER BY score DESC, timestamp ASC').all().map(mapChart);
  const uniqueChartData = [];
  const seen = new Set();
  for (const item of chartRows) {
    if (!seen.has(item.openid)) {
      uniqueChartData.push(item);
      seen.add(item.openid);
    }
  }
  const users = db.prepare('SELECT * FROM users').all();
  const data = uniqueChartData.map((chartItem) => {
    const userItem = users.find((user) => user.openid === chartItem.openid);
    return {
      ...chartItem,
      nickname: userItem ? userItem.nickname : '',
      avatarUrl: userItem ? userItem.avatar : ''
    };
  });
  return { success: true, data };
}

function getMenleiList() {
  const db = getDb();
  const rows = db.prepare("SELECT DISTINCT menlei AS _id FROM zy_more WHERE menlei IS NOT NULL AND menlei != ''").all();
  return { success: true, data: rows.map((item) => item._id) };
}

function getYijixuekeList(event) {
  const db = getDb();
  const rows = db.prepare("SELECT DISTINCT yijixueke AS _id FROM zy_more WHERE menlei = ? AND yijixueke IS NOT NULL AND yijixueke != ''").all(event.menlei);
  return { success: true, data: rows.map((item) => item._id) };
}

function getMajors(event) {
  const db = getDb();
  const page = Number(event.page) || 1;
  const pageSize = Number(event.pageSize) || 20;
  const searchQuery = event.searchQuery || '';
  const schoolname = event.schoolname || '';
  const where = ['schoolname = ?'];
  const params = [schoolname];
  if (searchQuery) {
    where.push('LOWER(major) LIKE ?');
    params.push(like(searchQuery));
  }
  const data = db.prepare(`
    SELECT * FROM yx_more
    WHERE ${where.join(' AND ')}
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize);
  return { data };
}

function searchSchools(event) {
  const db = getDb();
  const major = event.major || '';
  const region = event.region || '';
  const rows = db.prepare(`
    SELECT m.*, y.schooladdress
    FROM zy_more m
    LEFT JOIN yx y ON y.schoolname = m.schoolname
    WHERE LOWER(IFNULL(m.profession_name, '')) LIKE ?
      AND LOWER(IFNULL(y.schooladdress, '')) LIKE ?
    LIMIT 50
  `).all(like(major), like(region));

  const extraStmt = db.prepare(`
    SELECT exam_style, learn_type, language, political, enrollment, class1, class2, major
    FROM yx_more
    WHERE schoolname = ?
      AND (major LIKE ? OR major_num = ?)
    LIMIT 1
  `);

  const data = rows.map((row) => {
    const extra = extraStmt.get(row.schoolname, `%${row.profession_name || ''}%`, String(row.major_num || '').replace(/\.0$/, ''));
    return {
      ...row,
      major: (extra && extra.major) || row.major || row.profession_name,
      region: row.schooladdress || row.region || '',
      exam_style: (extra && extra.exam_style) || row.exam_style,
      learn_type: (extra && extra.learn_type) || row.learn_type,
      language: (extra && extra.language) || row.language,
      political: (extra && extra.political) || row.political,
      enrollment: (extra && extra.enrollment) || row.enrollment,
      class1: extra ? extra.class1 : '',
      class2: extra ? extra.class2 : ''
    };
  });
  return { success: true, data };
}

function schoolLevel(title) {
  const text = String(title || '');
  if (/985|211985/.test(text)) return 3;
  if (/211/.test(text)) return 2;
  return 1;
}

function parseMockScore(event) {
  const raw = event.score != null && event.score !== '' ? event.score : event.mockScore;
  const score = Number(raw);
  if (!Number.isFinite(score)) return null;
  return Math.round(score);
}

function mixForScore(score) {
  if (score >= 360) return { 3: 4, 2: 5, 1: 3 };
  if (score >= 330) return { 3: 3, 2: 5, 1: 4 };
  if (score >= 300) return { 3: 1, 2: 5, 1: 6 };
  return { 3: 0, 2: 3, 1: 9 };
}

function bucketFor(level, score) {
  if (score >= 330) {
    if (level >= 3) return 'sprint';
    if (level === 2) return 'stable';
    return 'safe';
  }
  if (score >= 300) {
    if (level >= 3) return 'sprint';
    if (level === 2) return 'stable';
    return 'safe';
  }
  if (level >= 2) return 'sprint';
  return 'stable';
}

function assignBuckets(picked, score) {
  if (score >= 330) {
    for (const item of picked) {
      item.bucket = bucketFor(item.level, score);
    }
    return;
  }
  const ordinary = [];
  for (const item of picked) {
    if (item.level >= 2) {
      item.bucket = 'sprint';
    } else {
      ordinary.push(item);
    }
  }
  if (ordinary.length <= 1) {
    ordinary.forEach((item) => {
      item.bucket = 'safe';
    });
    return;
  }
  const mid = Math.ceil(ordinary.length / 2);
  ordinary.forEach((item, index) => {
    item.bucket = index < mid ? 'stable' : 'safe';
  });
}

function pickCandidates(rows, score) {
  const grouped = new Map();
  for (const row of rows) {
    const key = row.schoolname || '';
    if (!grouped.has(key)) grouped.set(key, []);
    if (grouped.get(key).length < 2) grouped.get(key).push(row);
  }

  const byLevel = { 3: [], 2: [], 1: [] };
  for (const items of grouped.values()) {
    const level = items[0].level >= 3 ? 3 : items[0].level === 2 ? 2 : 1;
    byLevel[level].push(items);
  }

  const mix = mixForScore(score);
  return [
    ...byLevel[3].slice(0, mix[3]),
    ...byLevel[2].slice(0, mix[2]),
    ...byLevel[1].slice(0, mix[1])
  ].flat();
}

function uniqueNames(list) {
  return [...new Set(list.map((item) => item.schoolname).filter(Boolean))];
}

function localReport({ score, major, region, undergrad, groups }) {
  const nameList = (list) => {
    const names = uniqueNames(list);
    return names.length ? names.join('、') : '暂无匹配';
  };
  return [
    `根据你的条件（模拟分数：${score} / 500，专业：${major}，地区：${region || '不限'}，本科层次：${undergrad || '未填写'}），先从院校库里筛了一批可报考方向。`,
    '',
    `冲刺：${nameList(groups.sprint)}`,
    `稳妥：${nameList(groups.stable)}`,
    `保底：${nameList(groups.safe)}`,
    '',
    '建议：冲刺校关注复试和专业课难度，稳妥校核对招生人数与考试科目，保底校优先看学习方式和报录比。分数只是初筛，最终还要对照目标院校近年复试线和报录情况。'
  ].join('\n');
}

async function aiChoice(event) {
  const major = String(event.major || '').trim();
  const region = String(event.region || '').trim();
  const undergrad = String(event.undergrad || '未选择').trim();
  const score = parseMockScore(event);

  if (!major) {
    return { success: false, errorMessage: '请先填写目标专业' };
  }
  if (score == null) {
    return { success: false, errorMessage: '请填写模拟分数' };
  }
  if (score < 100 || score > 500) {
    return { success: false, errorMessage: '模拟分数按考研初试总分填写，范围 100–500' };
  }

  const db = getDb();
  const rows = db.prepare(`
    SELECT m.*, y.schooladdress, y.title AS school_title, y.type AS school_type
    FROM zy_more m
    LEFT JOIN yx y ON y.schoolname = m.schoolname
    WHERE LOWER(IFNULL(m.profession_name, '')) LIKE ?
      AND LOWER(IFNULL(y.schooladdress, '')) LIKE ?
    LIMIT 80
  `).all(like(major), like(region));

  const extraStmt = db.prepare(`
    SELECT exam_style, learn_type, language, political, enrollment, class1, class2, major
    FROM yx_more
    WHERE schoolname = ?
      AND (major LIKE ? OR major_num = ?)
    LIMIT 1
  `);

  const enriched = rows.map((row) => {
    const extra = extraStmt.get(
      row.schoolname,
      `%${row.profession_name || ''}%`,
      String(row.major_num || '').replace(/\.0$/, '')
    );
    const title = row.school_title || '';
    return {
      ...row,
      major: (extra && extra.major) || row.major || row.profession_name,
      region: row.schooladdress || row.region || '',
      school_title: title,
      school_type: row.school_type || '',
      exam_style: (extra && extra.exam_style) || row.exam_style,
      learn_type: (extra && extra.learn_type) || row.learn_type,
      language: (extra && extra.language) || row.language,
      political: (extra && extra.political) || row.political,
      enrollment: (extra && extra.enrollment) || row.enrollment,
      class1: extra ? extra.class1 : '',
      class2: extra ? extra.class2 : '',
      level: schoolLevel(title)
    };
  });

  const picked = pickCandidates(enriched, score);
  const groups = { sprint: [], stable: [], safe: [] };
  if (!picked.length) {
    return {
      success: true,
      usedAI: false,
      report: `院校库里没有找到「${major}」${region ? '在「' + region + '」' : ''}的匹配结果，可以换个专业名，或把地区留空再试。`,
      groups,
      data: []
    };
  }
  assignBuckets(picked, score);
  for (const item of picked) {
    item.itemKey = `${item.schoolname}_${item.direaction || ''}_${item.major_num || ''}`;
    groups[item.bucket].push(item);
  }

  const brief = picked.map((item) => ({
    学校: item.schoolname,
    层次: item.school_title,
    类型: item.school_type,
    地区: item.region,
    专业: item.profession_name || item.major,
    方向: item.direaction,
    拟录取: item.enrollment,
    考试方式: item.exam_style,
    档次: item.bucket === 'sprint' ? '冲刺' : item.bucket === 'stable' ? '稳妥' : '保底'
  }));

  let usedAI = false;
  let report = localReport({ score, major, region, undergrad, groups });
  let ai = { ok: false, reason: 'missing_key' };
  try {
    ai = await deepseek.chat([
      {
        role: 'system',
        content: '你是考研择校顾问。只用用户提供的学校列表做建议，不要编造列表里没有的学校。结合模拟分数判断冲刺/稳妥/保底是否合理。用简洁中文，分四段：1.总体判断 2.冲刺校理由 3.稳妥/保底校理由 4.备考提醒。不要使用 Markdown 标题符号。'
      },
      {
        role: 'user',
        content: `考生画像：本科层次=${undergrad}，模拟分数=${score}/500（考研初试总分），目标专业=${major}，意向地区=${region || '不限'}。\n候选学校如下：\n${JSON.stringify(brief, null, 2)}\n请给出择校报告。`
      }
    ]);
  } catch (err) {
    ai = { ok: false, reason: 'api_error', message: err.message };
  }

  if (ai.ok) {
    usedAI = true;
    report = ai.text;
  } else if (ai.reason && ai.reason !== 'missing_key') {
    console.warn('DeepSeek 择校未成功:', ai.reason, ai.message || '');
    report = `${report}\n\n（DeepSeek 暂时不可用，以上为院校库规则推荐）`;
  }

  return {
    success: true,
    usedAI,
    score,
    report,
    groups,
    data: picked
  };
}

function getQuestionDetails(event) {
  const db = getDb();
  const ids = event.questionIds || [];
  const data = ids.map((id) => mapQuestion(db.prepare('SELECT * FROM questions WHERE _id = ?').get(id))).filter(Boolean);
  return { success: true, data };
}

function getAdditionalDetails(event) {
  const db = getDb();
  const majorNum = String(event.majorNum || '').replace(/\.0$/, '');
  const data = db.prepare("SELECT * FROM yx_more WHERE REPLACE(major_num, '.0', '') = ?").all(majorNum);
  return { success: true, data };
}

function loadSchools() {
  const db = getDb();
  const data = db.prepare('SELECT * FROM remenyuanxiao').all();
  return { success: true, data };
}

function getCuoti(event, ctx) {
  const db = getDb();
  const openid = event.openid || ctx.openid;
  const data = db.prepare('SELECT * FROM cuoti WHERE openid = ?').all(openid).map(mapCuoti);
  return { success: true, data };
}

function addCuoti(event, ctx) {
  const db = getDb();
  const openid = event.openid || ctx.openid;
  if (!openid) {
    return { success: false, errorMessage: '未登录' };
  }
  const _id = newId('cuoti');
  db.prepare(`
    INSERT INTO cuoti (_id, openid, cttx, cttg, ctxx, zqda)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    _id,
    openid,
    event.cttx || '',
    event.cttg || '',
    JSON.stringify(event.ctxx || []),
    event.zqda || ''
  );
  return { success: true, _id };
}

function removeCuoti(event, ctx) {
  const db = getDb();
  const openid = ctx.openid;
  const row = db.prepare('SELECT * FROM cuoti WHERE _id = ?').get(event.id);
  if (!row) {
    return { success: false, errorMessage: '记录不存在' };
  }
  if (openid && row.openid !== openid) {
    return { success: false, errorMessage: '无权删除' };
  }
  db.prepare('DELETE FROM cuoti WHERE _id = ?').run(event.id);
  return { success: true };
}

const handlers = {
  login,
  getschool,
  getschoolDetail,
  getschool_2,
  getProfessions,
  getProfessionDetail,
  getQuestions,
  getRandomQuestions,
  submitScore,
  uploadUserInfo,
  getChartData,
  getMenleiList,
  getYijixuekeList,
  getMajors,
  searchSchools,
  aiChoice,
  getQuestionDetails,
  getAdditionalDetails,
  loadSchools,
  getCuoti,
  addCuoti,
  removeCuoti
};

module.exports = handlers;
