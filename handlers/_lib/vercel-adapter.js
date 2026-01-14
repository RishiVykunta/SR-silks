function isNetlifyStyleResponse(result) {
  return !!result && typeof result === 'object' && 'statusCode' in result && 'headers' in result;
}

function sendNetlifyStyleResponse(res, result) {
  const status = result.statusCode || 200;
  const headers = result.headers || {};
  const body = result.body;

  res.status(status);
  if (headers && typeof headers === 'object') {
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) res.setHeader(key, value);
    }
  }

  if (body === undefined) return res.end();

  // If body is a string, send it as-is. Most handlers return JSON strings.
  if (typeof body === 'string') return res.send(body);

  return res.json(body);
}

async function runHandler(handler, req, res) {
  const result = await handler(req, res);

  // If handler already wrote to res, we do nothing.
  if (res.headersSent) return;

  if (isNetlifyStyleResponse(result)) {
    sendNetlifyStyleResponse(res, result);
    return;
  }

  // If handler returned something else, send it as JSON.
  if (result !== undefined) {
    res.json(result);
    return;
  }

  res.end();
}

module.exports = {
  runHandler
};

