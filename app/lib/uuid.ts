/**
 * Generate a unique UUID for contract operations
 * @param prefix - Optional prefix for the UUID (e.g., 'post', 'creator')
 * @param id - Optional ID to include in the UUID
 * @returns A unique UUID string
 */
export function generateUUID(prefix?: string, id?: string | number): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  const idPart = id ? `-${id}` : '';
  const prefixPart = prefix ? `${prefix}-` : '';
  
  return `${prefixPart}${timestamp}${idPart}-${randomPart}`;
}

/**
 * Generate a UUID for post tokens
 * @param postId - The post ID from the API
 * @returns A unique UUID for the post token
 */
export function generatePostTokenUUID(postId: string | number): string {
  // Use a deterministic approach - just use the post ID with a prefix
  // This ensures the same UUID is generated for the same post ID
  return `post-${postId}`;
}

/**
 * Generate a UUID for creator tokens
 * @param creatorId - The creator ID
 * @returns A unique UUID for the creator token
 */
export function generateCreatorTokenUUID(creatorId: string | number): string {
  return generateUUID('creator', creatorId);
}

