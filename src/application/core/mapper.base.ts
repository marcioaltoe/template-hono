/**
 * Base mapper interface for converting between different representations
 * Used to map between domain entities, DTOs, and persistence models
 */
export interface Mapper<TDomain, TDto, TPersistence> {
  /**
   * Maps from domain entity to DTO (for presentation layer)
   */
  toDTO(domain: TDomain): TDto

  /**
   * Maps from DTO to domain entity
   */
  toDomain(dto: TDto): TDomain

  /**
   * Maps from domain entity to persistence model (for database)
   */
  toPersistence(domain: TDomain): TPersistence

  /**
   * Maps from persistence model to domain entity
   */
  fromPersistence(persistence: TPersistence): TDomain
}

/**
 * Simplified mapper for when DTO and persistence models are the same
 */
export interface SimpleMapper<TDomain, TData> {
  /**
   * Maps from domain entity to data representation
   */
  toData(domain: TDomain): TData

  /**
   * Maps from data representation to domain entity
   */
  toDomain(data: TData): TDomain
}

/**
 * Base class for mappers with common functionality
 */
export abstract class BaseMapper<TDomain, TDto, TPersistence>
  implements Mapper<TDomain, TDto, TPersistence>
{
  abstract toDTO(domain: TDomain): TDto
  abstract toDomain(dto: TDto): TDomain
  abstract toPersistence(domain: TDomain): TPersistence
  abstract fromPersistence(persistence: TPersistence): TDomain

  /**
   * Maps an array of domain entities to DTOs
   */
  public toDTOList(domains: TDomain[]): TDto[] {
    return domains.map((domain) => this.toDTO(domain))
  }

  /**
   * Maps an array of DTOs to domain entities
   */
  public toDomainList(dtos: TDto[]): TDomain[] {
    return dtos.map((dto) => this.toDomain(dto))
  }

  /**
   * Maps an array of domain entities to persistence models
   */
  public toPersistenceList(domains: TDomain[]): TPersistence[] {
    return domains.map((domain) => this.toPersistence(domain))
  }

  /**
   * Maps an array of persistence models to domain entities
   */
  public fromPersistenceList(persistences: TPersistence[]): TDomain[] {
    return persistences.map((persistence) => this.fromPersistence(persistence))
  }
}

/**
 * Factory for creating mappers
 */
export interface MapperFactory {
  /**
   * Gets a mapper for the specified type
   */
  getMapper<TDomain, TDto, TPersistence>(type: string): Mapper<TDomain, TDto, TPersistence>
}

/**
 * Registry for mappers
 */
export class MapperRegistry implements MapperFactory {
  private readonly mappers = new Map<string, Mapper<any, any, any>>()

  /**
   * Registers a mapper for a specific type
   */
  public register<TDomain, TDto, TPersistence>(
    type: string,
    mapper: Mapper<TDomain, TDto, TPersistence>,
  ): void {
    this.mappers.set(type, mapper)
  }

  /**
   * Gets a mapper for the specified type
   */
  public getMapper<TDomain, TDto, TPersistence>(type: string): Mapper<TDomain, TDto, TPersistence> {
    const mapper = this.mappers.get(type)
    if (!mapper) {
      throw new Error(`No mapper registered for type: ${type}`)
    }
    return mapper
  }

  /**
   * Checks if a mapper is registered for a type
   */
  public hasMapper(type: string): boolean {
    return this.mappers.has(type)
  }

  /**
   * Clears all registered mappers
   */
  public clear(): void {
    this.mappers.clear()
  }
}
