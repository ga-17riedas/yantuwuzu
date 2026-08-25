const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  wechatAppId: process.env.WECHAT_APPID || 'wx63b409c1ca6524b5',
  wechatAppSecret: process.env.WECHAT_APPSECRET || '',
  forceSeed: process.env.FORCE_SEED === '1',
  dataDir: path.join(__dirname, '..', 'data'),
  dbPath: path.join(__dirname, '..', 'data', 'yantuwuzu.db'),
  databaseDir: path.join(__dirname, '..', '..', 'database'),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/chat/completions'
};
