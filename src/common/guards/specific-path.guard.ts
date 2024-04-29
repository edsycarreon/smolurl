import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SpecificPathGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    const urls = ['/links'];
    if (urls.includes(path)) {
      return true;
    }

    return false;
  }
}
