import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;
const rawFromEmail = process.env.RESEND_FROM_EMAIL || "hello@nubb.store";
const fromEmail = rawFromEmail.includes("<")
  ? rawFromEmail
  : `NUBB <${rawFromEmail}>`;

export async function sendWelcomeEmail(toEmail: string, name?: string) {
  if (!resendClient) {
    console.log(
      `[Resend Mock] Welcome email queued for ${toEmail} (Add RESEND_API_KEY to .env.local to send live emails).`
    );
    return { success: true, mock: true };
  }

  const greetingName = name?.trim() ? ` ${name.trim()}` : "";

  try {
    const data = await resendClient.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "Welcome to NUBB - The Things We Carry",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #E8E6D8;
                color: #4D3F15;
                margin: 0;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 16px;
                border: 2px solid #4D3F15;
                box-shadow: 6px 6px 0px #4D3F15;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .brand-title {
                font-size: 36px;
                font-weight: 900;
                color: #892F1A;
                letter-spacing: 2px;
                margin: 0;
              }
              .tagline {
                font-size: 14px;
                letter-spacing: 4px;
                color: #4D3F15;
                text-transform: uppercase;
                margin-top: 8px;
              }
              .content {
                line-height: 1.6;
                font-size: 16px;
                color: #624A41;
              }
              .badge {
                display: inline-block;
                background-color: #892F1A;
                color: #E8E6D8;
                padding: 6px 16px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 20px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #E8E6D8;
                text-align: center;
                font-size: 12px;
                color: #892F1A;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="brand-title">NUBB</h1>
                <div class="tagline">The Things We Carry</div>
              </div>
              <div class="content">
                <div class="badge">Early Access Confirmed</div>
                <p>Hello${greetingName},</p>
                <p>Thank you for joining NUBB. We are currently crafting handmade objects that blur the line between art and utility.</p>
                <p>Every piece is made by hand, shaped by instinct, and designed to be used, carried, tied, clipped, worn, or displayed.</p>
                <p>We'll notify you the exact moment our e-commerce store goes live with our first limited batch release.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} NUBB. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Resend Error] Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendLaunchAnnouncementEmail({
  toEmail,
  name,
  customSubject,
  customMessage,
}: {
  toEmail: string;
  name?: string | null;
  customSubject?: string;
  customMessage?: string;
}) {
  if (!resendClient) {
    console.log(
      `[Resend Mock] Launch email queued for ${toEmail} (Add RESEND_API_KEY to .env.local to send live emails).`
    );
    return { success: true, mock: true };
  }

  const greetingName = name?.trim() ? ` ${name.trim()}` : "";
  const subject = customSubject || "We are Live! NUBB Store is Officially Open";
  const defaultBody = `
    <p>The wait is over. Our online store is officially live, and our first limited batch of handmade utility objects is now available.</p>
    <p>Every piece is made by hand in limited quantities. Explore the collection before items sell out.</p>
  `;

  try {
    const data = await resendClient.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #E8E6D8;
                color: #4D3F15;
                margin: 0;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 16px;
                border: 2px solid #4D3F15;
                box-shadow: 6px 6px 0px #4D3F15;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .brand-title {
                font-size: 36px;
                font-weight: 900;
                color: #892F1A;
                letter-spacing: 2px;
                margin: 0;
              }
              .tagline {
                font-size: 14px;
                letter-spacing: 4px;
                color: #4D3F15;
                text-transform: uppercase;
                margin-top: 8px;
              }
              .content {
                line-height: 1.6;
                font-size: 16px;
                color: #624A41;
              }
              .badge {
                display: inline-block;
                background-color: #892F1A;
                color: #E8E6D8;
                padding: 6px 16px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 20px;
              }
              .cta-button {
                display: inline-block;
                margin-top: 20px;
                padding: 14px 28px;
                background-color: #4D3F15;
                color: #E8E6D8 !important;
                text-decoration: none;
                font-weight: bold;
                font-size: 15px;
                letter-spacing: 1px;
                text-transform: uppercase;
                border-radius: 4px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #E8E6D8;
                text-align: center;
                font-size: 12px;
                color: #892F1A;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="brand-title">NUBB</h1>
                <div class="tagline">The Things We Carry</div>
              </div>
              <div class="content">
                <div class="badge">Store is Now Live</div>
                <p>Hello${greetingName},</p>
                ${customMessage ? `<p>${customMessage.replace(/\n/g, "<br/>")}</p>` : defaultBody}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://nubb.store" class="cta-button">Shop The Collection &rarr;</a>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} NUBB. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Resend Error] Failed to send launch announcement email:", error);
    return { success: false, error };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resendClient) {
    console.log(`[Resend Mock] Email to ${to} ("${subject}") queued.`);
    return { success: true, mock: true };
  }

  try {
    const data = await resendClient.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("[Resend Error] Failed to send email:", error);
    return { success: false, error };
  }
}
