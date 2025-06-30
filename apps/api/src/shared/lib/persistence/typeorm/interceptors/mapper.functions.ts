// Função que converte de snake_case para camelCase
function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, group1) => group1.toUpperCase())
}

function camelToSnake(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

function transformKeysToCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj

  const newObj: any = {}
  for (const key of Object.keys(obj)) {
    const camelKey = snakeToCamel(key)
    const value = obj[key]

    if (Array.isArray(value)) {
      newObj[camelKey] = value.map(transformKeysToCamelCase)
    } else if (typeof value === 'object' && value !== null) {
      newObj[camelKey] = transformKeysToCamelCase(value)
    } else {
      newObj[camelKey] = value
    }
  }

  return newObj
}

function transformKeysToSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj

  const newObj: any = {}
  for (const key of Object.keys(obj)) {
    const snakeKey = camelToSnake(key)
    const value = obj[key]

    if (Array.isArray(value)) {
      newObj[snakeKey] = value.map(transformKeysToSnakeCase)
    } else if (typeof value === 'object' && value !== null) {
      newObj[snakeKey] = transformKeysToSnakeCase(value)
    } else {
      newObj[snakeKey] = value
    }
  }

  return newObj
}


export function mapToDomain(data: any): any {
  if (Array.isArray(data)) {
    return data.map(transformKeysToCamelCase)
  }
  return transformKeysToCamelCase(data)
}

export function mapToEntity(data: any): any {
  if (Array.isArray(data)) {
    return data.map(transformKeysToSnakeCase)
  }
  return transformKeysToSnakeCase(data)
}
