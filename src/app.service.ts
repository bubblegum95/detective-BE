import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  async checkDatabaseConnection(): Promise<string> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'Database connection is healthy';
    } catch (error) {
      return `Database connection error: ${error.message}`;
    }
  }
}
