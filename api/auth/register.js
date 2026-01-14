const { runHandler } = require('../../handlers/_lib/vercel-adapter');
const handler = require('../../handlers/auth/register');

module.exports = async (req, res) => {
  return runHandler(handler, req, res);
};
