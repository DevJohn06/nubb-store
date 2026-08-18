import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "NUBB <onboarding@resend.dev>";

export async function sendWelcomeEmail(toEmail: string) {
  if (!resendClient) {
    console.log(`[Resend Mock] Welcome email queued for ${toEmail} (Add RESEND_API_KEY to .env.local to send live emails).`);
    return { success: true, mock: true };
  }

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
                background-color: #640017;
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
                <div class="badge">You're On The VIP List</div>
                <p>Hello,</p>
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
    // Don't fail the subscriber action if email fails (e.g. unverified domain on free tier)
    return { success: false, error };
  }
}
