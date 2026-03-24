import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Load Firebase config
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else {
    console.warn("firebase-applet-config.json not found at", configPath);
  }
} catch (err) {
  console.error("Error reading firebase-applet-config.json:", err);
}

// Initialize Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const databaseId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

if (!getApps().length && projectId) {
  initializeApp({
    projectId,
  });
}

const db = getFirestore(undefined, databaseId);
const app = express();
const PORT = 3000;

app.use(express.json());

// API: Send OTP via Email
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  try {
    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 2. Store OTP in Firestore
    await db.collection("otps").doc(email).set({
      otp,
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Send Email
    // NOTE: User must configure these in .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const storeName = process.env.STORE_NAME || "Shoppando.ao";
    const mailOptions = {
      from: `"${storeName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `O teu código de verificação - ${storeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ea580c; text-align: center;">${storeName}</h2>
          <p>Olá!</p>
          <p>O teu código de verificação para criar conta é:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">Este código expira em 5 minutos.</p>
          <p>Se não solicitaste este código, ignora este e-mail.</p>
        </div>
      `,
    };

    // If SMTP is not configured, we'll log it for development
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return res.json({ 
        success: true, 
        message: "OTP gerado (Verifica os logs do servidor em desenvolvimento)." 
      });
    }

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Código enviado para o teu e-mail." });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ 
      error: "Erro ao enviar código por e-mail.",
      details: error.message 
    });
  }
});

// API: Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "E-mail e código são obrigatórios." });
  }

  try {
    const otpDoc = await db.collection("otps").doc(email).get();

    if (!otpDoc.exists) {
      return res.status(400).json({ error: "Código não encontrado ou expirado." });
    }

    const data = otpDoc.data();
    const now = new Date();

    if (data?.otp !== otp) {
      return res.status(400).json({ error: "Código inválido." });
    }

    if (data?.expiresAt.toDate() < now) {
      return res.status(400).json({ error: "Código expirado." });
    }

    // OTP is valid, delete it
    await db.collection("otps").doc(email).delete();

    res.json({ success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Erro ao verificar código." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
