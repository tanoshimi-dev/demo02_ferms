import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: 'demo02_ferms-backend',
      status: 'running',
    };
  }
}
