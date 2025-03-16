import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter: nodemailer.transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASSWORD'),
      },
    });
  }

  async create(to: User['email'], subject: string, text: string) {
    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
