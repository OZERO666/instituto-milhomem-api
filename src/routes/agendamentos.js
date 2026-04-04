import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';
import { sendMail } from '../utils/mailer.js';

const router = Router();

router.get('/', authMiddleware, checkPermission('leads', 'read'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM agendamentos ORDER BY created DESC');
    res.json(rows);
  } catch (error) {
    logger.error('Agendamentos GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, tipo_servico, mensagem } = req.body;

    // Validação de campos obrigatórios
    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'nome, email e telefone são obrigatórios' });
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    const id = uuidv4(); // ← gerado pelo servidor, não pelo cliente
    const now = new Date();

    await pool.execute(
      'INSERT INTO agendamentos (id, nome, email, telefone, tipo_servico, mensagem, lido, created, updated) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)',
      [id, nome, email, telefone, tipo_servico || null, mensagem || null, now, now]
    );

    logger.info(`Novo agendamento recebido: ${nome} (${email})`);

    const SITE_URL  = process.env.SITE_URL || 'https://institutomilhomem.com';
    const LOGO_URL  = 'https://horizons-cdn.hostinger.com/386178fc-68a2-4ae9-99a1-df6a1385b4b9/1e20c7dbf245fee0e2ca926ad4054327.png';
    const WHATSAPP  = (process.env.WHATSAPP_NUMBER || '5562981070937').replace(/\D/g, '');
    const firstName = nome.split(' ')[0];
    const now       = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const waMsg     = encodeURIComponent(`Olá! Entrei em contato pelo site e gostaria de mais informações${tipo_servico ? ` sobre ${tipo_servico}` : ''}.`);

    // Notificação para a clínica
    sendMail({
      subject: `📋 Novo contato — ${nome}`,
      replyTo: email,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1a1a2e;padding:20px 32px;border-radius:8px 8px 0 0;text-align:center">
            <img src="${LOGO_URL}" alt="Instituto Milhomem" style="height:56px;object-fit:contain" />
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
            <h2 style="color:#B8860B;border-bottom:2px solid #B8860B;padding-bottom:8px;margin-top:0">Novo contato recebido</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;font-weight:bold;width:140px">Nome:</td><td style="padding:8px">${nome}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px"><a href="mailto:${email}" style="color:#B8860B">${email}</a></td></tr>
              <tr><td style="padding:8px;font-weight:bold">Telefone:</td><td style="padding:8px">${telefone}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Serviço:</td><td style="padding:8px">${tipo_servico || '—'}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Mensagem:</td><td style="padding:8px;white-space:pre-wrap">${mensagem || '—'}</td></tr>
            </table>
            <p style="margin-top:20px;font-size:12px;color:#999">
              Recebido em ${now} · <a href="${SITE_URL}/admin" style="color:#B8860B">Ver no painel</a>
            </p>
          </div>
        </div>
      `,
    });

    // Confirmação para o cliente
    sendMail({
      to: email,
      subject: `Recebemos seu contato, ${firstName}! — Instituto Milhomem`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f0">
          <div style="background:#1a1a2e;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center">
            <img src="${LOGO_URL}" alt="Instituto Milhomem" style="height:64px;object-fit:contain" />
            <p style="color:#B8860B;margin:10px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold">Clínica de Saúde Capilar</p>
          </div>
          <div style="height:4px;background:linear-gradient(90deg,#B8860B,#d4a017,#B8860B)"></div>
          <div style="background:#fff;padding:40px 32px">
            <h2 style="color:#1a1a2e;margin-top:0;font-size:22px">Olá, ${firstName}! Recebemos seu contato. 👋</h2>
            <p style="color:#555;line-height:1.7;font-size:15px">
              Sua mensagem foi recebida com sucesso. Nossa equipe entrará em contato em até
              <strong style="color:#B8860B">24 horas úteis</strong>.
            </p>
            ${tipo_servico ? `
            <div style="background:#f9f6ef;border-left:4px solid #B8860B;padding:14px 18px;margin:24px 0;border-radius:0 6px 6px 0">
              <p style="margin:0;color:#555;font-size:14px">Serviço de interesse:</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-weight:bold;font-size:16px">${tipo_servico}</p>
            </div>` : ''}
            <hr style="border:none;border-top:1px solid #eee;margin:28px 0">
            <p style="color:#555;font-size:15px;margin-bottom:14px">Quer agilizar? Fale agora pelo WhatsApp:</p>
            <a href="https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${waMsg}"
               style="display:inline-block;background:#25D366;color:#fff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px">
              💬 Chamar no WhatsApp
            </a>
            <p style="margin-top:36px;color:#555;font-size:14px;line-height:1.7">
              Atenciosamente,<br>
              <strong style="color:#1a1a2e">Equipe Instituto Milhomem</strong>
            </p>
          </div>
          <div style="background:#1a1a2e;padding:16px 32px;border-radius:0 0 8px 8px;text-align:center">
            <p style="color:#888;font-size:12px;margin:0">
              <a href="${SITE_URL}" style="color:#B8860B;text-decoration:none">${SITE_URL.replace('https://', '')}</a>
              &nbsp;·&nbsp; Goiânia, GO
            </p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ message: 'Agendamento recebido com sucesso' });
  } catch (error) {
    logger.error('Agendamentos POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, checkPermission('leads', 'update'), async (req, res) => {
  try {
    const { lido } = req.body;

    const [result] = await pool.execute(
      'UPDATE agendamentos SET lido=?, updated=? WHERE id=?',
      [lido ? 1 : 0, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Agendamentos PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('leads', 'delete'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM agendamentos WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Agendamentos DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
