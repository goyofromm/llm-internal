import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import 'dotenv/config';
  
  @Injectable()
  export class ApiKeyGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      
      const apiKey = request.headers['x-api-key'];
  
      if (apiKey !== process.env.APP_API_KEY) {
        throw new UnauthorizedException('No tienes permiso para acceder a este recurso.');
      }
  
      return true;
    }
  }