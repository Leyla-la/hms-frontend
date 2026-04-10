/**
 * Normalizes API responses that may be paginated (Spring Page object) or a simple array.
 * Always returns an array of items.
 */
export function normalizeListResponse<T>(response: any): T[] {
  if (!response) return [];
  
  // Case 1: Direct content array (Spring Page-like object)
  if (Array.isArray(response.content)) {
    return response.content;
  }
  
  // Case 2: Data wrapper (common in some custom HMS endpoints)
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Case 3: Nested data.content (combination)
  if (response.data && Array.isArray(response.data.content)) {
    return response.data.content;
  }
  
  // Case 4: Already an array
  if (Array.isArray(response)) {
    return response;
  }
  
  // Case 5: Single object wrapped in array (fallback for buggy endpoints)
  if (typeof response === 'object' && response !== null && !Array.isArray(response)) {
    // If it's a page object but content is missing/empty, return empty
    if ('totalPages' in response || 'totalElements' in response) {
      return [];
    }
    return [response as T];
  }

  return [];
}

/**
 * Extracts totalElements from a paginated response if available.
 */
export function getPaginationCount(response: any): number {
  if (!response) return 0;
  if (typeof response.totalElements === 'number') return response.totalElements;
  if (response.data && typeof response.data.totalElements === 'number') return response.data.totalElements;
  
  const content = normalizeListResponse(response);
  return content.length;
}
