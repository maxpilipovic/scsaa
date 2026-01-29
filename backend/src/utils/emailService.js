import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email to a single recipient
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} text - Plain text version of the email (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const sendEmail = async (to, subject, html, text = null) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@scsaa.org',
      subject,
      html,
      ...(text && { text }),
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return false;
  }
};

/**
 * Send email to multiple recipients
 * @param {string[]} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} text - Plain text version of the email (optional)
 * @returns {Promise<object>} - Results with success/failure counts
 */
export const sendBulkEmail = async (recipients, subject, html, text = null) => {
  const results = {
    success: 0,
    failed: 0,
    failedEmails: [],
  };

  try {
    // SendGrid allows up to 1000 recipients per request
    const chunks = [];
    for (let i = 0; i < recipients.length; i += 1000) {
      chunks.push(recipients.slice(i, i + 1000));
    }

    for (const chunk of chunks) {
      const personalizations = chunk.map((email) => ({
        to: [{ email }],
      }));

      const msg = {
        personalizations,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@scsaa.org',
        subject,
        html,
        ...(text && { text }),
      };

      try {
        await sgMail.send(msg);
        results.success += chunk.length;
      } catch (chunkError) {
        console.error('Error in bulk send chunk:', chunkError.message);
        results.failed += chunk.length;
        results.failedEmails.push(...chunk);
      }
    }

    console.log(`Bulk email sent: ${results.success} succeeded, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error('Error in sendBulkEmail:', error.message);
    return {
      success: 0,
      failed: recipients.length,
      failedEmails: recipients,
    };
  }
};

/**
 * Email template for new announcement
 */
export const announcementEmailTemplate = (announcementTitle, announcementPreview, siteUrl = 'http://localhost:5173') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .cta-button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📢 New Announcement</h2>
        </div>
        <div class="content">
          <h3>${announcementTitle}</h3>
          <p>${announcementPreview}</p>
          <a href="${siteUrl}" class="cta-button">View Full Announcement</a>
          <div class="footer">
            <p>You received this email because you are a member of SCSAA.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for new event
 */
export const eventEmailTemplate = (eventName, eventDescription, eventLocation, eventStartTime, siteUrl = 'http://localhost:5173') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .event-details { background-color: #e3f2fd; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
        .event-details p { margin: 5px 0; }
        .cta-button { display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📅 New Event: ${eventName}</h2>
        </div>
        <div class="content">
          <p>We have a new event coming up!</p>
          <div class="event-details">
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p><strong>Date & Time:</strong> ${new Date(eventStartTime).toLocaleString()}</p>
          </div>
          <p>${eventDescription}</p>
          <a href="${siteUrl}" class="cta-button">View Event Details</a>
          <div class="footer">
            <p>You received this email because you are a member of SCSAA.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for payment confirmation
 */
export const paymentConfirmationTemplate = (memberName, amount, transactionId, siteUrl = 'http://localhost:5173') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .payment-details { background-color: #f0f9f6; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .payment-details p { margin: 8px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .cta-button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Payment Received</h2>
        </div>
        <div class="content">
          <p>Hi ${memberName},</p>
          <p>Thank you for your payment! Your membership is now active.</p>
          <div class="payment-details">
            <p><strong>Amount:</strong> <span class="amount">$${amount}</span></p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Your membership provides access to all chapter events, resources, and community.</p>
          <a href="${siteUrl}/dashboard" class="cta-button">View Your Dashboard</a>
          <div class="footer">
            <p>If you have any questions, please contact our chapter officers.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for membership renewal
 */
export const renewalConfirmationTemplate = (memberName, renewalDate, expiresAt, siteUrl = 'http://localhost:5173') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .renewal-details { background-color: #fff3e0; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
        .renewal-details p { margin: 8px 0; }
        .cta-button { display: inline-block; background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔄 Membership Renewed</h2>
        </div>
        <div class="content">
          <p>Hi ${memberName},</p>
          <p>Your membership has been successfully renewed!</p>
          <div class="renewal-details">
            <p><strong>Renewed On:</strong> ${new Date(renewalDate).toLocaleString()}</p>
            <p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
          </div>
          <p>Thank you for your continued support of SCSAA!</p>
          <a href="${siteUrl}/dashboard" class="cta-button">View Your Membership</a>
          <div class="footer">
            <p>If you have any questions about your membership, please contact us.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generic email template for admin custom emails
 */
export const customEmailTemplate = (subject, body) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #5C6AC4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${subject}</h2>
        </div>
        <div class="content">
          ${body}
          <div class="footer">
            <p>You received this email from SCSAA.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
