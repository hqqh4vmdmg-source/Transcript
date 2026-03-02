// Automated Email Notification Service
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    // Configure based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use actual email service (SendGrid, AWS SES, etc.)
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development: Use Ethereal for testing
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || 'test@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'test'
        }
      });
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@transcriptgenerator.com',
      to: user.email,
      subject: 'Welcome to Transcript Generator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4ecca3;">Welcome to Transcript Generator!</h2>
          <p>Hi ${user.username},</p>
          <p>Thank you for registering with Transcript Generator. You can now create professional transcripts for both high school and college.</p>
          <h3>Getting Started:</h3>
          <ul>
            <li>Navigate to the transcript generator</li>
            <li>Choose between high school or college mode</li>
            <li>Fill in your information</li>
            <li>Download your professional transcript as PDF</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Transcript Generator Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send transcript generated notification
   */
  async sendTranscriptNotification(user, transcript) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@transcriptgenerator.com',
      to: user.email,
      subject: 'Your Transcript is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4ecca3;">Transcript Generated Successfully</h2>
          <p>Hi ${user.username},</p>
          <p>Your ${transcript.type.replace('_', ' ')} transcript has been generated successfully.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Transcript Details:</h3>
            <p><strong>Type:</strong> ${transcript.type.replace('_', ' ')}</p>
            <p><strong>School:</strong> ${transcript.data.schoolName}</p>
            <p><strong>Student:</strong> ${transcript.data.studentName}</p>
            <p><strong>GPA:</strong> ${transcript.data.cumulativeGPA}</p>
            <p><strong>Created:</strong> ${new Date(transcript.created_at).toLocaleDateString()}</p>
          </div>
          <p>You can download your transcript from your dashboard.</p>
          <p>Best regards,<br>The Transcript Generator Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Transcript notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending transcript notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@transcriptgenerator.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4ecca3;">Password Reset Request</h2>
          <p>Hi ${user.username},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4ecca3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br>The Transcript Generator Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send account verification email
   */
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@transcriptgenerator.com',
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4ecca3;">Verify Your Email</h2>
          <p>Hi ${user.username},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4ecca3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>The Transcript Generator Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send support ticket confirmation
   */
  async sendSupportTicketConfirmation(user, ticket) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@transcriptgenerator.com',
      to: user.email,
      subject: `Support Ticket #${ticket.id} - ${ticket.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4ecca3;">Support Ticket Received</h2>
          <p>Hi ${user.username},</p>
          <p>We've received your support request and will get back to you soon.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Created:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>You can track your ticket status in your account dashboard.</p>
          <p>Best regards,<br>The Support Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Support ticket confirmation sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending support ticket confirmation:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
