const config = require('./config');

async function chat(messages, options = {}) {
  if (!config.deepseekApiKey) {
    return { ok: false, reason: 'missing_key' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 40000);

  try {
    const response = await fetch(config.deepseekBaseUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.deepseekApiKey}`
      },
      body: JSON.stringify({
        model: config.deepseekModel,
        temperature: options.temperature == null ? 0.6 : options.temperature,
        max_tokens: options.maxTokens || 1400,
        messages
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      const message = (payload.error && payload.error.message) || `DeepSeek HTTP ${response.status}`;
      return { ok: false, reason: 'api_error', message };
    }

    const text = payload.choices && payload.choices[0] && payload.choices[0].message
      ? payload.choices[0].message.content
      : '';
    if (!text) {
      return { ok: false, reason: 'empty' };
    }
    return { ok: true, text: String(text).trim() };
  } catch (err) {
    const aborted = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR');
    return {
      ok: false,
      reason: aborted ? 'timeout' : 'network',
      message: aborted ? 'DeepSeek 超时' : (err.message || '网络错误')
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { chat };
