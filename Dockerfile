FROM node:14

# 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# 애플리케이션 코드 복사
WORKDIR /usr/src/app
COPY package*.json ./

# 종속성 설치
RUN npm install

# 애플리케이션 코드 복사
COPY . .

# 애플리케이션 실행
CMD [ "node", "app.js" ]
