import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendEmail(mailOptions);
      console.log('성공');
    } catch (error) {
      console.error('실패:', error);
    }
  }
}
