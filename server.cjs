const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
const nodemailer = require('nodemailer');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function send(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleInquiry(req, res) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();
    const data = JSON.parse(body || '{}');

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const message = (data.message || '').trim();

    if (!email || !message) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, message: 'Email and message are required.' }));
      return;
    }

    const host = process.env.SMTP_HOST;
    const portEnv = Number(process.env.SMTP_PORT || 0);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !portEnv || !user || !pass || !from) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, message: 'SMTP is not configured on the server.' }));
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: portEnv,
      secure: portEnv === 465, // true for 465, false for other ports (STARTTLS)
      auth: { user, pass }
    });

    const mailOptions = {
      from: `${from}`,
      to: from,
      subject: `Portfolio inquiry from ${name || email}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Failed to handle inquiry:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, message: err.message || 'Failed to send email' }));
  }
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const requested = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');

    // API route for contact form
    if (url.pathname === '/api/inquiry' && req.method === 'POST') {
      handleInquiry(req, res);
      return;
    }

    const filePath = path.join(root, requested === '/' ? 'index.html' : requested);

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        send(res, filePath);
        return;
      }

      send(res, path.join(root, 'index.html'));
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Portfolio preview running at http://127.0.0.1:${port}`);
  });
