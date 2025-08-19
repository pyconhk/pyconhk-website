// First, create a utility to transform keys from snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Generic function to transform any object or array recursively
function transformToCamelCase<T>(data: any): T {
  if (Array.isArray(data)) {
    return data.map(item => transformToCamelCase(item)) as unknown as T;
  }

  if (data !== null && typeof data === 'object') {
    const newObj: Record<string, any> = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const camelKey = toCamelCase(key);
        newObj[camelKey] = transformToCamelCase(data[key]);
      }
    }

    return newObj as T;
  }

  return data as T;
}

export { toCamelCase, transformToCamelCase };
