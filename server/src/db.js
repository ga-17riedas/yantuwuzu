const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('./config');

let db;

function getDb() {
  if (!db) {
    throw new Error('数据库尚未初始化');
  }
  return db;
}

function initSchema(instance) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS yx (
      _id TEXT PRIMARY KEY,
      schoolname TEXT,
      schooladdress TEXT,
      belong TEXT,
      title TEXT,
      type TEXT,
      website TEXT,
      jianjie TEXT,
      jianjie_neirong TEXT,
      lingdao TEXT,
      lingdao_neirong TEXT,
      huanjing TEXT,
      huanjing_neirong TEXT
    );

    CREATE TABLE IF NOT EXISTS yx_more (
      _id TEXT PRIMARY KEY,
      schoolname TEXT,
      major TEXT,
      major_num TEXT,
      menlei TEXT,
      yijixueke TEXT,
      exam_style TEXT,
      learn_type TEXT,
      language TEXT,
      political TEXT,
      enrollment TEXT,
      class1 TEXT,
      class2 TEXT
    );

    CREATE TABLE IF NOT EXISTS zy (
      _id TEXT PRIMARY KEY,
      profession_name TEXT,
      profession_number TEXT,
      profession_type TEXT
    );

    CREATE TABLE IF NOT EXISTS zy_more (
      _id TEXT PRIMARY KEY,
      profession_name TEXT,
      schoolname TEXT,
      direaction TEXT,
      major_num TEXT,
      menlei TEXT,
      yijixueke TEXT,
      major TEXT,
      region TEXT,
      enrollment TEXT,
      exam_style TEXT,
      language TEXT,
      learn_type TEXT,
      political TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      _id TEXT PRIMARY KEY,
      tx TEXT,
      tg TEXT,
      score INTEGER,
      xx TEXT,
      zqda TEXT
    );

    CREATE TABLE IF NOT EXISTS remenyuanxiao (
      _id TEXT PRIMARY KEY,
      schoolname TEXT,
      pinggu TEXT,
      type TEXT,
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      openid TEXT UNIQUE,
      nickname TEXT,
      avatar TEXT,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS chart (
      _id TEXT PRIMARY KEY,
      openid TEXT,
      score INTEGER,
      incorrectQuestions TEXT,
      time INTEGER,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS cuoti (
      _id TEXT PRIMARY KEY,
      openid TEXT,
      cttx TEXT,
      cttg TEXT,
      ctxx TEXT,
      zqda TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_yx_name ON yx(schoolname);
    CREATE INDEX IF NOT EXISTS idx_yx_address ON yx(schooladdress);
    CREATE INDEX IF NOT EXISTS idx_yx_more_school ON yx_more(schoolname);
    CREATE INDEX IF NOT EXISTS idx_yx_more_major_num ON yx_more(major_num);
    CREATE INDEX IF NOT EXISTS idx_zy_name ON zy(profession_name);
    CREATE INDEX IF NOT EXISTS idx_zy_more_name ON zy_more(profession_name);
    CREATE INDEX IF NOT EXISTS idx_zy_more_major_num ON zy_more(major_num);
    CREATE INDEX IF NOT EXISTS idx_cuoti_openid ON cuoti(openid);
    CREATE INDEX IF NOT EXISTS idx_chart_openid ON chart(openid);
  `);
  instance.exec(`
    UPDATE zy_more SET major_num = REPLACE(major_num, '.0', '') WHERE major_num LIKE '%.0';
    UPDATE yx_more SET major_num = REPLACE(major_num, '.0', '') WHERE major_num LIKE '%.0';
  `);
}

function initDb() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function parseJson(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function mapQuestion(row) {
  if (!row) return row;
  return { ...row, xx: parseJson(row.xx, []) };
}

function mapCuoti(row) {
  if (!row) return row;
  return { ...row, ctxx: parseJson(row.ctxx, []) };
}

function mapChart(row) {
  if (!row) return row;
  return { ...row, incorrectQuestions: parseJson(row.incorrectQuestions, []) };
}

module.exports = {
  initDb,
  getDb,
  parseJson,
  mapQuestion,
  mapCuoti,
  mapChart
};
