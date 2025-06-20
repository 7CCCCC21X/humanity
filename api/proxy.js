// api/proxy.js
export default async function handler(req, res) {
  // 允许 GET/POST 都行，只做简单转发
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const target = req.query.url;
  if (!target) {
    res.status(400).json({ error: 'Missing url param' });
    return;
  }

  try {
    // 透明转发
    const r = await fetch(target, {
      // 某些 API 需要 UA，否则 403
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    // 将返回内容原样输出
    const buf = await r.arrayBuffer();
    res.status(r.status);
    // 复制原始 content-type，JSON、br 等都能保持
    if (r.headers.get('content-type'))
      res.setHeader('Content-Type', r.headers.get('content-type'));
    // CORS 头开放给前端
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
