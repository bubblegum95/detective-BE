import { diskStorage } from 'multer';
import { extname, join } from 'path';

// Multer 저장소 설정
const storage = diskStorage({
  destination: join(process.cwd(), 'public', 'images'), // 저장할 폴더 경로
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname);
    callback(null, `${uniqueSuffix}${extension}`); // 유니크한 파일명 생성
  },
});

export const multerOptions = {
  storage,
};
