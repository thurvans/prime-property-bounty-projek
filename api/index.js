let appPromise;

module.exports = async function handler(req, res) {
  if (!appPromise) {
    appPromise = import('../server/src/app.js').then(({ default: app }) => app);
  }

  const url = new URL(req.url, 'http://vercel.internal');
  const rewritePath = url.searchParams.get('path');
  if (rewritePath) {
    url.searchParams.delete('path');
    const query = url.searchParams.toString();
    req.url = `/api/${rewritePath}${query ? `?${query}` : ''}`;
  }

  const app = await appPromise;
  return app(req, res);
};
