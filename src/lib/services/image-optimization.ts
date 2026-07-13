/**
 * Image Optimization Service
 * Server-side image resizing and optimization
 */

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'jpeg' | 'png' | 'original';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  originalSize?: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  orientation?: number;
}

// Default optimization presets
export const OPTIMIZATION_PRESETS = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 70,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  avatar: {
    width: 256,
    height: 256,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  preview: {
    width: 800,
    height: 600,
    quality: 80,
    format: 'webp' as const,
    fit: 'inside' as const,
  },
  full: {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'webp' as const,
    fit: 'inside' as const,
  },
  ogImage: {
    width: 1200,
    height: 630,
    quality: 90,
    format: 'jpeg' as const,
    fit: 'cover' as const,
  },
};

/**
 * Get image optimization service URL
 * Uses Next.js Image Optimization or external service
 */
function getOptimizationUrl(
  originalUrl: string,
  options: ImageOptimizationOptions
): string {
  const baseUrl = process.env.IMAGE_OPTIMIZATION_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://cuanpintar.com';

  const params = new URLSearchParams();

  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  if (options.fit) params.set('fit', options.fit);

  params.set('url', originalUrl);

  return `${baseUrl}/api/image/optimize?${params.toString()}`;
}

/**
 * Upload and optimize image
 * For use with Supabase Storage
 */
export async function uploadAndOptimizeImage(
  file: Buffer | ArrayBuffer,
  filename: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    width = 1920,
    height = 1080,
    quality = 85,
    format = 'webp',
  } = options;

  // In production, use Sharp for actual optimization
  // For now, we store the original and return the URL
  const bucket = 'images';

  // Generate unique filename
  const ext = format === 'original' ? filename.split('.').pop() : format;
  const optimizedFilename = `${filename.replace(/\.[^.]+$/, '')}_${width}x${height}.${ext}`;

  if (isSupabaseConfigured()) {
    try {
      // Upload original
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}_${filename}`, file, {
          contentType: `image/${ext}`,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      return {
        url: urlData.publicUrl,
        width,
        height,
        format,
        size: file instanceof Buffer ? file.length : 0,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Demo mode: return mock response
  return {
    url: `https://storage.example.com/images/${optimizedFilename}`,
    width,
    height,
    format,
    size: file instanceof Buffer ? file.length : 0,
  };
}

/**
 * Optimize existing image URL
 * Returns URLs for multiple presets
 */
export async function getOptimizedImageUrls(
  originalUrl: string
): Promise<{
  thumbnail: string;
  avatar: string;
  preview: string;
  full: string;
  ogImage: string;
  original: string;
}> {
  return {
    thumbnail: getOptimizationUrl(originalUrl, OPTIMIZATION_PRESETS.thumbnail),
    avatar: getOptimizationUrl(originalUrl, OPTIMIZATION_PRESETS.avatar),
    preview: getOptimizationUrl(originalUrl, OPTIMIZATION_PRESETS.preview),
    full: getOptimizationUrl(originalUrl, OPTIMIZATION_PRESETS.full),
    ogImage: getOptimizationUrl(originalUrl, OPTIMIZATION_PRESETS.ogImage),
    original: originalUrl,
  };
}

/**
 * Delete image and its variants
 */
export async function deleteOptimizedImages(
  imageUrl: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true; // Demo mode
  }

  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(p => p === 'images' || p === 'storage');
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Delete image error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete image error:', error);
    return false;
  }
}

/**
 * Validate image file
 */
export function validateImage(
  file: File,
  options: {
    maxSize?: number; // bytes
    acceptedFormats?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  // Check file type
  if (!acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Accepted: ${acceptedFormats.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate responsive srcset
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  return widths
    .map(w => {
      const optimizedUrl = getOptimizationUrl(baseUrl, { width: w, quality: 80 });
      return `${optimizedUrl} ${w}w`;
    })
    .join(', ');
}

/**
 * Get image placeholder (blur hash or dominant color)
 */
export async function getImagePlaceholder(
  imageUrl: string
): Promise<{
  blurDataUrl?: string;
  dominantColor?: string;
}> {
  // In production, generate blur hash from image
  // For now, return placeholder
  return {
    dominantColor: '#E2E8F0', // Light gray as fallback
  };
}

export default {
  uploadAndOptimizeImage,
  getOptimizedImageUrls,
  deleteOptimizedImages,
  validateImage,
  generateSrcSet,
  getImagePlaceholder,
  getOptimizationUrl,
  OPTIMIZATION_PRESETS,
};
