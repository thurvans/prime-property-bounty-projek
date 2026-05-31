import app from '../src/app.js';

export default function handler(req, res) {
  const url = new URL(req.url, 'http://vercel.internal');
  const rewritePath = url.searchParams.get('path');

  if (rewritePath) {
    url.searchParams.delete('path');
    const query = url.searchParams.toString();
    req.url = `/api/${rewritePath}${query ? `?${query}` : ''}`;
  }

  return app(req, res);
}
