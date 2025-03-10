import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// userInfo 커스텀 데코레이터 생성
export const UserInfo = createParamDecorator((data: string | null, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  return user ? (data ? user[data] : user) : null;
});
