import { Module } from '@nestjs/common';
import { ProjectController } from './project/http/rest/project.controller';

@Module({
  imports: [],
  controllers: [ProjectController],
  providers: [],
})
export class AppModule {}
