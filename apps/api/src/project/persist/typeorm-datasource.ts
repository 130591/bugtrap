
import { NestFactory } from '@nestjs/core'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { dataSourceOptionsFactory } from './typeorm-datasource.factory'
config()

const getDataSource = async () => {
  const configModule = await NestFactory.createApplicationContext(ConfigModule.forRoot())
  const configService = configModule.get<ConfigService>(ConfigService)
  return new DataSource(dataSourceOptionsFactory(configService))
}

export default getDataSource()
