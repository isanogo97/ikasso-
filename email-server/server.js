const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://ikasso-pwxa.vercel.app', 'http://localhost:3000'],
  methods: ['POST'],
  credentials: true
}));
app.use(express.json());

// Configuration du transporteur Netim
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'mail1.netim.hosting',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true pour port 465
  auth: {
    user: process.env.SMTP_USER || 'noreply@ikasso.ml',
    pass: process.env.SMTP_PASSWORD || '94Valenton',
  },
  tls: {
    rejectUnauthorized: false // Pour éviter les erreurs de certificat
  }
});

// Vérifier la connexion au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Erreur de connexion SMTP:', error);
  } else {
    console.log('✅ Serveur SMTP prêt à envoyer des emails');
  }
});

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Ikasso Email Server',
    smtp: process.env.SMTP_HOST 
  });
});

// Route d'envoi d'email de vérification
app.post('/send-verification', async (req, res) => {
  try {
    const { email, name, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et code requis' 
      });
    }

    // HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .code-box { 
            background: #f8f9fa; 
            border: 3px dashed #667eea; 
            padding: 25px; 
            text-align: center; 
            margin: 30px 0;
            border-radius: 10px;
          }
          .code { 
            font-size: 36px; 
            font-weight: bold; 
            letter-spacing: 8px; 
            color: #667eea;
            font-family: 'Courier New', monospace;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            color: #666; 
            font-size: 13px; 
            padding: 20px;
            border-top: 1px solid #eee;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Bienvenue sur Ikasso !</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Bonjour <strong>${name || 'Cher utilisateur'}</strong>,</p>
            
            <p>Merci de vous être inscrit sur <strong>Ikasso</strong>, votre plateforme de location et d'expériences au Mali.</p>
            
            <p>Pour finaliser votre inscription, veuillez utiliser le code de vérification ci-dessous :</p>
            
            <div class="code-box">
              <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Votre code de vérification</div>
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>⏱️ Important :</strong> Ce code est valable pendant <strong>15 minutes</strong>.
            </div>
            
            <p style="margin-top: 30px;">Si vous n'avez pas créé de compte sur Ikasso, ignorez simplement cet email.</p>
            
            <p style="margin-top: 30px;">
              Besoin d'aide ? Contactez notre équipe :<br>
              📧 <a href="mailto:support@ikasso.ml" style="color: #667eea;">support@ikasso.ml</a><br>
              💬 <a href="mailto:contact@ikasso.ml" style="color: #667eea;">contact@ikasso.ml</a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              À bientôt sur Ikasso !<br>
              <strong>L'équipe Ikasso Mali</strong> 🇲🇱
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Ikasso Mali</strong>. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    const info = await transporter.sendMail({
      from: `"Ikasso Mali" <${process.env.SMTP_USER || 'noreply@ikasso.ml'}>`,
      to: email,
      subject: '🔐 Votre code de vérification Ikasso',
      html: htmlContent,
      text: `Bonjour ${name || 'Cher utilisateur'},\n\nVotre code de vérification Ikasso est : ${code}\n\nCe code est valable pendant 15 minutes.\n\nÀ bientôt sur Ikasso !\nL'équipe Ikasso Mali`
    });

    console.log('✅ Email envoyé:', info.messageId, 'à', email);

    res.json({ 
      success: true, 
      message: 'Email envoyé avec succès',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message 
    });
  }
});

// Route d'envoi SMS (à implémenter plus tard)
app.post('/send-sms', async (req, res) => {
  try {
    const { phone, code } = req.body;

    console.log(`📱 SMS simulé pour ${phone}: Code ${code}`);

    // À implémenter avec un service SMS
    res.json({ 
      success: true, 
      message: 'SMS envoyé (simulé)',
      code: code 
    });

  } catch (error) {
    console.error('❌ Erreur SMS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi du SMS',
      error: error.message 
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur email Ikasso démarré sur le port ${PORT}`);
  console.log(`📧 SMTP: ${process.env.SMTP_HOST}`);
  console.log(`👤 User: ${process.env.SMTP_USER}`);
});

