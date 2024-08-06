# 베이스 이미지 선택
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production

# package.json과 package-lock.json 복사
COPY package*.json ./

# 모든 종속성 설치 (개발 종속성 포함)
RUN npm ci

# NestJS CLI 전역 설치
RUN npm install -g @nestjs/cli

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 프로덕션 종속성만 남기고 개발 종속성 제거
RUN npm prune --production

# 애플리케이션 실행을 위한 포트 노출
EXPOSE ${SERVER_PORT}

# 애플리케이션 실행
CMD ["node", "dist/main"]