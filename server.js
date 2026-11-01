const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function resolveFilePath(urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.(\/|\\|$))+/, '');
  const rootCandidate = path.join(__dirname, safePath);
  if (fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()) {
    return rootCandidate;
  }
  const publicCandidate = path.join(__dirname, 'public', safePath);
  if (fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
    return publicCandidate;
  }
  return null;
}

const crypto = require('crypto');

function wrapPcmToWav(pcmBuf, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuf.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuf.length, 40);
  return Buffer.concat([header, pcmBuf]);
}

const TTS_MODELS = [
  'gemini-3.8-flash-lite-tts',
  'gemini-3.8-flash-tts',
  'gemini-2.5-flash-preview-tts'
];
let ttsModelCounter = 0;

async function synthesizeGeminiTtsWav(text, voiceName, styleDesc) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  const cleanVoice = voiceName || 'Aoede';
  const cleanStyle = styleDesc || 'Style: Vocal Smile, Pace: Natural, Accent: Neutral';
  const hash = crypto
    .createHash('sha1')
    .update(`${cleanVoice}|${cleanStyle}|${text}`)
    .digest('hex')
    .slice(0, 14);
  const cacheDir = path.join(__dirname, 'public', 'voices');
  const cacheFile = path.join(cacheDir, `ai-cache-${cleanVoice.toLowerCase()}-${hash}.wav`);
  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 1000) {
    return fs.readFileSync(cacheFile);
  }

  let lastErr = null;
  for (let attempt = 0; attempt < TTS_MODELS.length; attempt++) {
    const model = TTS_MODELS[(ttsModelCounter++) % TTS_MODELS.length];
    const is38 = model.startsWith('gemini-3.8');
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            is38
              ? { text, speechMetadata: { style: cleanStyle } }
              : { text: `Speak with ${cleanStyle}: ${text}` }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: cleanVoice }
          }
        }
      }
    };

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          },
          body: JSON.stringify(body)
        }
      );
      if (!resp.ok) {
        lastErr = new Error(`Gemini TTS HTTP ${resp.status}`);
        continue;
      }
      const json = await resp.json();
      const part = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (part && part.data) {
        let wavBuf = Buffer.from(part.data, 'base64');
        if (wavBuf.slice(0, 4).toString('ascii') !== 'RIFF') {
          wavBuf = wrapPcmToWav(wavBuf, 24000);
        }
        try {
          if (fs.existsSync(cacheDir)) {
            fs.writeFileSync(cacheFile, wavBuf);
          }
        } catch (e) {}
        return wavBuf;
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Gemini TTS synthesis failed');
}

const server = http.createServer((req, res) => {
  const rawUrl = (req.url || '/').split('?')[0];

  if (req.method === 'POST' && rawUrl === '/api/tts') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 32768) req.destroy();
    });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(rawBody || '{}');
        const text = String(parsed.text || '').trim();
        const voiceName = String(parsed.voiceName || 'Aoede').trim();
        const style = String(parsed.style || 'Style: Vocal Smile, Pace: Natural, Accent: Neutral').trim();
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Missing text parameter' }));
          return;
        }
        const wavBuf = await synthesizeGeminiTtsWav(text, voiceName, style);
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': wavBuf.length,
          'Cache-Control': 'public, max-age=86400'
        });
        res.end(wavBuf);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err && err.message ? err.message : 'TTS error' }));
      }
    });
    return;
  }

  const requestedPath = rawUrl === '/' ? '/index.html' : rawUrl;

  let filePath = resolveFilePath(requestedPath);
  if (!filePath && !path.extname(requestedPath)) {
    filePath = path.join(__dirname, 'index.html');
  }

  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    if (!isNaN(start) && !isNaN(end) && start <= end && end < stat.size) {
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }
  }

  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


