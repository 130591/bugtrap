import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity';
import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  OptimisticLockVersionMismatchError,
  Repository,
} from 'typeorm';
import { ConcurrencyException } from './exceptions';
import { Mapper } from '../decorators';

export abstract class DefaultTypeOrmRepository<T extends DefaultEntity<T>> {
  protected repository: Repository<T>;
  constructor(
    readonly entity: EntityTarget<T>,
    readonly manager: EntityManager,
  ) {
    /**
     * Note that we don't extend the Repository class from TypeORM, but we use it as a property.
     * This way we can control the access to the repository methods and avoid exposing them to the outside world.
     */
    this.repository = manager.getRepository(entity);
  }

  @Mapper({ to: 'entity' })
  async save(entity: T): Promise<T> {
    try {
      return await this.repository.save(entity)
    } catch (error) {
      if (error instanceof OptimisticLockVersionMismatchError) {
        throw new ConcurrencyException()
      }
      throw error
    }
  }

  @Mapper({ to: 'domain' })
  async findOneById(id: string, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
    });
  }

  @Mapper({ to: 'domain' })
  async find(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  @Mapper({ to: 'domain' })
  async findMany(options: FindManyOptions<T>): Promise<T[] | null> {
    return this.repository.find(options)
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  async existsBy(properties: FindOptionsWhere<T>): Promise<boolean> {
    return this.repository.exists({
      where: properties,
    });
  }
}
