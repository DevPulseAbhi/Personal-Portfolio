import { Resend } from 'resend';

const recipient = 'abhinavdeshwal01@gmail.com';
const defaultSender = 'Abhinav Deshwal <onboarding@resend.dev>';
const senderPattern = /^(?:[^<>]+ <)?[^\s@<>]+@[^\s@<>]+(?:>)?$/;

function getField(body, field) {
  const value = body?.[field];
  return typeof value === 'string' ? value.trim() : '';
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(503).json({
      error: 'Email service is not configured. Add RESEND_API_KEY to the server environment.',
    });
  }

  const name = getField(request.body, 'name');
  const email = getField(request.body, 'email');
  const subject = getField(request.body, 'subject');
  const message = getField(request.body, 'message');

  if (!name || !email || !subject || !message) {
    return response.status(400).json({ error: 'All contact fields are required.' });
  }

  if (name.length > 120 || email.length > 254 || subject.length > 200 || message.length > 5000) {
    return response.status(400).json({ error: 'One or more contact fields are too long.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const sender = process.env.RESEND_FROM_EMAIL || defaultSender;
  if (!senderPattern.test(sender)) {
    console.error('Invalid RESEND_FROM_EMAIL configuration.');
    return response.status(503).json({
      error: 'Email service has an invalid sender configuration.',
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: sender,
      to: [recipient],
      replyTo: email,
      subject: `Portfolio inquiry: ${subject}`,
      text: message,
    });

    if (error) {
      console.error('Resend rejected contact email:', error);
      return response.status(502).json({
        error: error.message || 'Resend rejected the email request.',
      });
    }

    return response.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Resend contact email request failed:', error);
    return response.status(502).json({
      error: error instanceof Error ? error.message : 'Email delivery failed.',
    });
  }
}
