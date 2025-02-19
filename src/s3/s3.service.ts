import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { File } from './entities/s3.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Detective } from '../detective/entities/detective.entity';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');
  }

  async savePath(path: string): Promise<File> {
    try {
      const savedFile = await this.fileRepository.save({ path });
      return savedFile;
    } catch (error) {
      throw error;
    }
  }

  async updateFile(file: File) {
    try {
      return await this.fileRepository.save(file);
    } catch (error) {
      throw error;
    }
  }

  async uploadFileToS3(type: string, file: Express.Multer.File) {
    try {
      const fileKey = `${type}/${uuidv4()}-${file.originalname}`;
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      const path = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
      return path;
    } catch (error) {
      throw error;
    }
  }

  async uploadFilesToS3(type: string, files: Express.Multer.File[]): Promise<string[]> {
    try {
      const fileArr: string[] = [];
      for (const file of files) {
        const path = await this.uploadFileToS3(type, file);
        fileArr.push(path);
      }
      return fileArr;
    } catch (error) {
      console.log('fail upload file to AWS S3: ', error.message);
      throw error;
    }
  }

  async creatPostProfile(file: File, detective: Detective) {
    file.detective = detective;
    return await this.fileRepository.save(file);
  }
}
