import { pool } from '../db/pool.js';

export async function createInquiry(req, res) {
  const { name, tel, email, message } = req.body;
  if (![name, tel, email, message].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Name, telephone, email, and message are required' });
  }
  const clean = [name.trim().slice(0, 120), tel.trim().slice(0, 40), email.trim().slice(0, 254), message.trim().slice(0, 4000)];
  const { rows } = await pool.query('INSERT INTO inquiries(name,tel,email,message) VALUES($1,$2,$3,$4) RETURNING id', clean);

  let notified = false;
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const text = `Новая заявка #${rows[0].id}\nИмя: ${clean[0]}\nТелефон: ${clean[1]}\nПочта: ${clean[2]}\nСообщение: ${clean[3]}`;
    try {
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
      });
      notified = response.ok;
    } catch {
      notified = false;
    }
  }
  res.status(201).json({ id: rows[0].id, saved: true, notified });
}

export async function listInquiries(_req, res) {
  const { rows } = await pool.query('SELECT id,name,tel,email,message,created_at FROM inquiries ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
}
