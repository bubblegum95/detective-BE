// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class RedisService {
//   private client: Redis;

//   constructor() {
//     this.client = new RedisClient({ host: 'localhost', port: 6379 });
//   }

//   saveMessage(senderId: string, recipientId: string, message: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       this.client.lpush(`messages:${recipientId}`, JSON.stringify({ senderId, message }), (err) => {
//         if (err) return reject(err);
//         resolve();
//       });
//     });
//   }

//   getMessages(recipientId: string): Promise<any[]> {
//     return new Promise((resolve, reject) => {
//       this.client.lrange(`messages:${recipientId}`, 0, -1, (err, messages) => {
//         if (err) return reject(err);
//         resolve(messages.map(message => JSON.parse(message)));
//       });
//     });
//   }
// }
