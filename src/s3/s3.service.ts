import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { File } from './entities/s3.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable } from 'typeorm/platform/PlatformTools';
import { ContentType } from './type/content-type.type';

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

  async uploadRegistrationFile(file: Express.Multer.File): Promise<number> {
    this.logger.log('upload registration file');
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
      const file = await this.fileRepository.save({ path });
      return file.id;
    } catch (error) {
      throw error;
    }
  }

  // 채팅 파일 업로드
  async uploadChatFiles(files: Express.Multer.File[]) {
    try {
      this.logger.log('upload chat files to S3');
      const fileArr = [];

      for (const file of files) {
        const fileKey = `chat/${uuidv4()}-${file.originalname}`;

        const params = {
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await this.s3Client.send(command);

        const path = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
        fileArr.push(path);
      }

      return fileArr;
    } catch (error) {
      console.log('fail upload files: ', error.message);
      throw error;
    }
  }

  // async downloadChatFiles(room: string) {
  //   try {
  //     const foundFiles = await this.chatFileModel.findOne({
  //       where: { room },
  //       select: { files: true },
  //     });
  //     const data = await this.downloadFiles(foundFiles.files);
  //     return data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // S3 파일 다운로드 받기
  async downloadFiles(filekeys: string[]): Promise<(Buffer | string)[]> {
    try {
      const promises = filekeys.map(async (filekey) => {
        const command = new GetObjectCommand({ Bucket: this.bucketName, Key: filekey });
        const response = await this.s3Client.send(command);

        const stream = response.Body as Readable;
        const mimetype = response.ContentType;

        // 데이터 스트리밍
        const streamedFile = await this.streamFile(stream, mimetype);
        return streamedFile;
      });

      return await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  }

  async streamFile(stream: Readable, mimetype: string): Promise<Buffer | string> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      // 읽어온 데이터를 Buffer에 추가
      stream.on('data', (chunk) => chunks.push(chunk));

      // 파일의 mimetype에 따라 문자열화 진행
      if (ContentType.includes(mimetype)) {
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        stream.on('error', reject);
      } else {
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      }
    });
  }
}
