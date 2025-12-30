import { environment } from '../../../environments/environment';

/**
 * Converts a relative or absolute image URL to a full URL
 * @param imageUrl The image URL from the article (could be external URL or /uploads/filename)
 * @returns Full URL for the image
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  // If it's already a full URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative URL (starts with /), prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `${environment.backendUrl}${imageUrl}`;
  }

  // Otherwise, assume it's a path and prepend backend URL with /
  return `${environment.backendUrl}/${imageUrl}`;
}
