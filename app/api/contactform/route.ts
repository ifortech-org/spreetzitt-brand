import { NextResponse } from "next/server";
import * as nodemailer from "nodemailer";

type HCaptchaVerifyResponse = {
  success: boolean;
  "error-codes"?: string[] | string;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  score?: number;
  score_reason?: string[];
};

// Escape base per HTML (evita injection nelle variabili utente)
function escapeHtml(str: string) {
  return str.replace(/[&<>'"/]/g, function (s) {
    const entity: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
      '/': '&#x2F;',
    };
    return entity[s] || s;
  });
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const mailSenderAccount = {
  user: process.env.MAIL_SENDER_ACCOUNT_USERNAME ?? null,
  pass: process.env.MAIL_SENDER_ACCOUNT_PASSWORD ?? null,
  email: process.env.MAIL_SENDER_ACCOUNT_EMAIL ?? null,
};

export async function POST(request: Request) {
  try {

    const {
      email,
      name,
      surname,
      business_name,
      request: requestType,
      description,
      lang = "it", // il front-end deve inviare la lingua, default "it"
      "h-captcha-response": hCaptchaToken
    } = await request.json();

    // Validazione hCaptcha
    if (!hCaptchaToken) {
      return NextResponse.json({ success: false, error: "Missing hCaptcha token" }, { status: 400 });
    }

    const hCaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
    if (!hCaptchaSecret) {
      return NextResponse.json({ success: false, error: "hCaptcha configuration missing" }, { status: 500 });
    }

    const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: hCaptchaSecret,
        response: hCaptchaToken,
        remoteip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }),
    });

    if (!verifyResponse.ok) {
      console.error('hCaptcha API error:', verifyResponse.statusText);
      return NextResponse.json({ success: false, error: "hCaptcha verification failed" }, { status: 400 });
    }

    const hCaptchaResult = await verifyResponse.json() as HCaptchaVerifyResponse;

    if (!hCaptchaResult.success) {
      console.error('hCaptcha validation failed:', hCaptchaResult["error-codes"]);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid hCaptcha",
        details: hCaptchaResult["error-codes"]
      }, { status: 400 });
    }

    // Validazione dei campi obbligatori
    if ( !email || !name || !surname || !business_name || !requestType || !description ) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Validazione email
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    // Applica escape HTML ai campi che verranno usati nei template
    const escapedName = escapeHtml(name);
    const escapedSurname = escapeHtml(surname || '');
    const escapedBusinessName = escapeHtml(business_name);
    const escapedRequestType = escapeHtml(requestType);
    const escapedDescription = escapeHtml(description);


    if (!mailSenderAccount.user || !mailSenderAccount.pass || !mailSenderAccount.email) {
      console.error("Email configuration missing:", {
        hasUser: !!mailSenderAccount.user,
        hasPass: !!mailSenderAccount.pass,
        hasEmail: !!mailSenderAccount.email,
        // Log solo i primi e ultimi caratteri della password per debug
        passPreview: mailSenderAccount.pass ? `${mailSenderAccount.pass.substring(0, 2)}...${mailSenderAccount.pass.slice(-2)}` : "undefined"
      });
      return NextResponse.json({ success: false, error: "Email configuration missing" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: mailSenderAccount.user,
        pass: mailSenderAccount.pass,
      },
    });

    const internalMailData = {
      from: mailSenderAccount.email,
      to: mailSenderAccount.email,
      subject: `SPREETZIT - Richiesta di contatto`,
      html: `
        <div>
          <h1>Nuova richiesta di contatto</h1>
          <p><strong>Nome:</strong> ${escapedName}</p>
          <p><strong>Cognome:</strong> ${escapedSurname}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Azienda:</strong> ${escapedBusinessName}</p>
          <p><strong>Oggetto della richiesta:</strong> ${escapedRequestType}</p>
          <p><strong>Descrizione:</strong></p>
          <p>${escapedDescription}</p>
        </div>
      `,
      text: `Nome: ${escapedName}\nCognome: ${escapedSurname}\nEmail: ${email}\nAzienda: ${escapedBusinessName}\nOggetto della richiesta: ${escapedRequestType}\nDescrizione:\n${escapedDescription}`
    };


    const subjectUser = lang == "en" ? "Contact request summary - Spreetzit" : "Riepilogo richiesta di contatto - Spreetzit";
    const bodyUser = lang == "en"
      ? `<div><h1>Spreetzit</h1><div><p>Dear ${escapedName} ${escapedSurname}, <br>Thank you for contacting us. Below is a summary of your request: <br><br><strong>Subject:</strong> ${escapedRequestType} <br><strong>Message:</strong> ${escapedDescription} <br><br>We will get back to you as soon as possible. <br><br>Best regards, <br><br>The Spreetzit Team</p></div></div>`
      : `<div><h1>Spreetzit</h1><div><p>Gentile ${escapedName} ${escapedSurname}, <br>Grazie per averci contattato. Di seguito il riepilogo della tua richiesta: <br><br><strong>Oggetto:</strong> ${escapedRequestType} <br><strong>Messaggio:</strong> ${escapedDescription} <br><br>Ti contatteremo al più presto. <br><br>Cordiali saluti, <br><br>Il Team di Spreetzit</p></div></div>`;

    const mailDataUser = {
      from: mailSenderAccount.email,
      to: email,
      subject: subjectUser,
      html: bodyUser,
    };

    // Invia entrambe le email   
    await transporter.sendMail(internalMailData);
    await transporter.sendMail(mailDataUser);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in contact form API:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
