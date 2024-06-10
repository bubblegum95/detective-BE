import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
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

  async uploadRegistrationFile(file: Express.Multer.File): Promise<number> {
    const fileKey = `registration/${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      const path = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;

      const savedFile = await this.fileRepository.save({ path });

      return savedFile.id;
    } catch (error) {
      throw new BadRequestException('File upload failed');
    }
  }
}
