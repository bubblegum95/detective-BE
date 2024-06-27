import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { File } from './entities/s3.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  @InjectRepository(File)
  private readonly fileRepository: Repository<File>;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');
  }

  async checkS3Connection() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      console.log('S3 connection successful. Buckets:', response.Buckets);
    } catch (error) {
      console.error(error.message);
    }
  }

  async uploadRegistrationFile(file: Express.Multer.File): Promise<number> {
    const fileKey = `registration/${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      // const checkConnection = await this.checkS3Connection();
      const command = new PutObjectCommand(params);

      const sentFile = await this.s3Client.send(command);
      console.log('sentFile', sentFile);
      const path = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
      console.log('path', path);
      const file = await this.fileRepository.save({ path });
      console.log('file', file);
      return file.id;
    } catch (error) {
      console.error(error.message);
    }
  }
}
