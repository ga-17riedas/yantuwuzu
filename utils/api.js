const { BASE_URL } = require('./config');

function requestFailMessage(err) {
  const msg = String((err && (err.errMsg || err.message)) || '');
  if (/timeout/i.test(msg)) return '请求超时，请确认后端已启动';
  if (/fail/i.test(msg)) return '连不上后端，请先在电脑运行 npm start';
  return '请求失败';
}

function callFunction({ name, data = {}, success, fail, complete, timeout }) {
  const token = wx.getStorageSync('token') || '';
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/fn/${name}`,
      method: 'POST',
      data,
      timeout: timeout || 12000,
      header: {
        'content-type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const wrapped = { result: res.data };
          success && success(wrapped);
          resolve(wrapped);
        } else {
          const error = res.data || res;
          error.errMsg = requestFailMessage(error);
          fail && fail(error);
          reject(error);
        }
      },
      fail(err) {
        const error = Object.assign({}, err, { errMsg: requestFailMessage(err) });
        fail && fail(error);
        reject(error);
      },
      complete
    });
  });
}

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        callFunction({
          name: 'login',
          data: {
            code: loginRes.code || '',
            openid: wx.getStorageSync('openid') || ''
          }
        }).then((res) => {
          const openid = res.result && res.result.openid;
          const token = res.result && res.result.token;
          if (openid) wx.setStorageSync('openid', openid);
          if (token) wx.setStorageSync('token', token);
          resolve(res);
        }).catch(reject);
      },
      fail() {
        callFunction({
          name: 'login',
          data: { openid: wx.getStorageSync('openid') || '' }
        }).then((res) => {
          const openid = res.result && res.result.openid;
          const token = res.result && res.result.token;
          if (openid) wx.setStorageSync('openid', openid);
          if (token) wx.setStorageSync('token', token);
          resolve(res);
        }).catch(reject);
      }
    });
  });
}

module.exports = {
  callFunction,
  login
};
