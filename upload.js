// Vercel Serverless Function: upload gambar ke imgbb memakai API key rahasia (env IMGBB_API_KEY)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method tidak diizinkan.' });
  }

  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    return res.status(500).json({ success: false, error: 'IMGBB_API_KEY belum diset di Vercel.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    let image = body.image || '';
    // buang prefix data URL kalau ada
    image = image.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');

    if (!image || image.length < 100) {
      return res.status(400).json({ success: false, error: 'Gambar tidak valid.' });
    }

    const r = await fetch('https://api.imgbb.com/1/upload?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ image }).toString(),
    });
    const j = await r.json();

    if (!j.success) {
      return res.status(502).json({
        success: false,
        error: (j.error && j.error.message) || 'Upload ke imgbb gagal.',
      });
    }

    return res.status(200).json({ success: true, url: j.data.url });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
};
