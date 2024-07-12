import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// userInfo 커스텀 데코레이터 생성
export const UserInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  if (ctx.getType() === 'http') {
    const request = ctx.switchToHttp().getRequest();
    return request.user ? request.user : null;
  } else if (ctx.getType() === 'ws') {
    const request = ctx.switchToWs().getClient();
    return request.user ? request.user : null;
  }
});
