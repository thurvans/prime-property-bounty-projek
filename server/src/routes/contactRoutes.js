import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import { z } from 'zod';
import { contactLimiter } from '../middleware/rateLimits.js';
import { getDb, saveDb } from '../services/store.js';
import { normalizeText } from '../utils/formatters.js';

const router = express.Router();

const contactSchema = z.object({
  nama: z.string().trim().min(1),
  email: z.string().trim().email(),
  nomor_hp: z.string().trim().regex(/^[0-9+\-\s()]{10,}$/),
  pesan: z.string().trim().min(1)
});

async function sendNotification(message) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { status: 'queued_no_smtp' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL || 'admin@primeproperty.local',
    subject: `Pesan baru dari ${message.nama}`,
    text: `Nama: ${message.nama}\nEmail: ${message.email}\nNomor HP: ${message.nomor_hp}\n\n${message.pesan}`
  });

  return { status: 'sent' };
}

router.post('/contact', contactLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      message: 'Lengkapi semua field, gunakan email valid, dan nomor HP minimal 10 digit.'
    });
  }

  const db = getDb();
  const message = {
    id: `msg_${crypto.randomUUID()}`,
    nama: normalizeText(parsed.data.nama),
    email: normalizeText(parsed.data.email),
    nomor_hp: normalizeText(parsed.data.nomor_hp),
    pesan: normalizeText(parsed.data.pesan),
    ip: req.ip,
    created_at: new Date().toISOString(),
    notification: { status: 'pending' }
  };

  message.notification = await sendNotification(message);
  db.contact_messages.unshift(message);
  await saveDb();

  res.status(201).json({ message: 'Pesan terkirim, tim kami akan menghubungi Anda.' });
});

export default router;
