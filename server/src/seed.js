const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const { getDb, initDb } = require('./db');
const sample = require('./sampleData');

function loadRecords(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    return JSON.parse(text);
  }
  return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (err) {
      throw new Error(`解析 ${filePath} 第 ${index + 1} 行失败: ${err.message}`);
    }
  });
}

function normalizeMajorNum(value) {
  if (value == null || value === '') return '';
  return String(value).replace(/\.0$/, '');
}

function ensureId(record, prefix) {
  if (record._id) return record;
  return { ...record, _id: `${prefix}_${crypto.randomUUID()}` };
}

function seedIfNeeded(force = false) {
  const db = getDb();
  const zyCount = db.prepare('SELECT COUNT(*) AS c FROM zy').get().c;
  const yxCount = db.prepare('SELECT COUNT(*) AS c FROM yx').get().c;
  if (!force && zyCount > 0 && yxCount > 0) {
    return { seeded: false, zyCount, yxCount };
  }

  const insertYx = db.prepare(`
    INSERT OR REPLACE INTO yx
    (_id, schoolname, schooladdress, belong, title, type, website, jianjie, jianjie_neirong, lingdao, lingdao_neirong, huanjing, huanjing_neirong)
    VALUES (@_id, @schoolname, @schooladdress, @belong, @title, @type, @website, @jianjie, @jianjie_neirong, @lingdao, @lingdao_neirong, @huanjing, @huanjing_neirong)
  `);
  const insertYxMore = db.prepare(`
    INSERT OR REPLACE INTO yx_more
    (_id, schoolname, major, major_num, menlei, yijixueke, exam_style, learn_type, language, political, enrollment, class1, class2)
    VALUES (@_id, @schoolname, @major, @major_num, @menlei, @yijixueke, @exam_style, @learn_type, @language, @political, @enrollment, @class1, @class2)
  `);
  const insertZy = db.prepare(`
    INSERT OR REPLACE INTO zy (_id, profession_name, profession_number, profession_type)
    VALUES (@_id, @profession_name, @profession_number, @profession_type)
  `);
  const insertZyMore = db.prepare(`
    INSERT OR REPLACE INTO zy_more
    (_id, profession_name, schoolname, direaction, major_num, menlei, yijixueke, major, region, enrollment, exam_style, language, learn_type, political)
    VALUES (@_id, @profession_name, @schoolname, @direaction, @major_num, @menlei, @yijixueke, @major, @region, @enrollment, @exam_style, @language, @learn_type, @political)
  `);
  const insertQuestion = db.prepare(`
    INSERT OR REPLACE INTO questions (_id, tx, tg, score, xx, zqda)
    VALUES (@_id, @tx, @tg, @score, @xx, @zqda)
  `);
  const insertHot = db.prepare(`
    INSERT OR REPLACE INTO remenyuanxiao (_id, schoolname, pinggu, type, title)
    VALUES (@_id, @schoolname, @pinggu, @type, @title)
  `);

  const yxFile = loadRecords(path.join(config.databaseDir, 'yx.json'));
  const yxMoreFile = loadRecords(path.join(config.databaseDir, 'yx_more.json'));
  const zyMoreFile = loadRecords(path.join(config.databaseDir, 'zy_more.json'));
  const zyFile = loadRecords(path.join(config.databaseDir, 'zy.json'));
  const questionsFile = loadRecords(path.join(config.databaseDir, 'questions.json'));
  const hotFile = loadRecords(path.join(config.databaseDir, 'remenyuanxiao.json'));

  const yxRows = (yxFile.length ? yxFile : sample.yx).map((item) => ensureId(item, 'yx'));
  const yxMoreRows = (yxMoreFile.length ? yxMoreFile : sample.yx_more).map((item) => ensureId(item, 'yxm'));
  const zyMoreRows = (zyMoreFile.length ? zyMoreFile : sample.zy_more).map((item) => ensureId(item, 'zym'));

  const tx = db.transaction(() => {
    if (force) {
      db.exec('DELETE FROM yx; DELETE FROM yx_more; DELETE FROM zy; DELETE FROM zy_more; DELETE FROM questions; DELETE FROM remenyuanxiao;');
    }
    for (const item of yxRows) {
      insertYx.run({
        _id: item._id,
        schoolname: item.schoolname || '',
        schooladdress: item.schooladdress || '',
        belong: item.belong || '',
        title: item.title == null ? '' : String(item.title),
        type: item.type || '',
        website: item.website || '',
        jianjie: item.jianjie || '院校简介',
        jianjie_neirong: item.jianjie_neirong || '',
        lingdao: item.lingdao || '现任领导',
        lingdao_neirong: item.lingdao_neirong || '',
        huanjing: item.huanjing || '校园环境',
        huanjing_neirong: item.huanjing_neirong || ''
      });
    }
    for (const item of yxMoreRows) {
      insertYxMore.run({
        _id: item._id,
        schoolname: item.schoolname || '',
        major: item.major || '',
        major_num: normalizeMajorNum(item.major_num),
        menlei: item.menlei || '',
        yijixueke: item.yijixueke || '',
        exam_style: item.exam_style || '',
        learn_type: item.learn_type || '',
        language: item.language || '',
        political: item.political || '',
        enrollment: item.enrollment == null ? '' : String(item.enrollment),
        class1: item.class1 || '',
        class2: item.class2 || ''
      });
    }
    for (const item of zyFile.map((row) => ensureId(row, 'zy'))) {
      insertZy.run({
        _id: item._id,
        profession_name: item.profession_name || '',
        profession_number: item.profession_number || '',
        profession_type: item.profession_type || ''
      });
    }
    for (const item of zyMoreRows) {
      insertZyMore.run({
        _id: item._id,
        profession_name: item.profession_name || '',
        schoolname: item.schoolname || '',
        direaction: item.direaction || '',
        major_num: normalizeMajorNum(item.major_num),
        menlei: item.menlei || '',
        yijixueke: item.yijixueke || '',
        major: item.major || item.profession_name || '',
        region: item.region || '',
        enrollment: item.enrollment == null ? '' : String(item.enrollment),
        exam_style: item.exam_style || '',
        language: item.language || '',
        learn_type: item.learn_type || '',
        political: item.political || ''
      });
    }
    for (const item of questionsFile.map((row) => ensureId(row, 'q'))) {
      insertQuestion.run({
        _id: item._id,
        tx: item.tx || '',
        tg: item.tg || '',
        score: Number(item.score) || 0,
        xx: JSON.stringify(item.xx || []),
        zqda: item.zqda || ''
      });
    }
    for (const item of hotFile.map((row) => ensureId(row, 'hot'))) {
      insertHot.run({
        _id: item._id,
        schoolname: item.schoolname || '',
        pinggu: item.pinggu || '',
        type: item.type || '',
        title: item.title || ''
      });
    }
  });

  tx();
  return {
    seeded: true,
    yx: yxRows.length,
    yxMore: yxMoreRows.length,
    zy: zyFile.length,
    zyMore: zyMoreRows.length,
    questions: questionsFile.length,
    remenyuanxiao: hotFile.length
  };
}

if (require.main === module) {
  initDb();
  const result = seedIfNeeded(true);
  console.log('种子数据导入完成', result);
}

module.exports = { seedIfNeeded, loadRecords };
