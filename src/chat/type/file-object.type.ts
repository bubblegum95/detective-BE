interface FileObject {
  originalname: string;
  fileType: string;
  buffer: Buffer;
  chunkIndex: number;
  totalChunks: number;
}
