/**
 * File Upload Service - Enhanced with Image Optimization
 *
 * Handles file uploads with:
 * - Image optimization (Sharp-based)
 * - File type validation
 * - Size limits
 * - Multiple storage backends (local, Supabase, S3-compatible)
 * - Responsive image generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  imageMaxDimensions: {
    width: 2048,
    height: 2048,
  },
  // Responsive image sizes
  responsiveSizes: [320, 640, 960, 1280, 1920],
  // Optimization presets
  presets: {
    thumbnail: { width: 150, height: 150, quality: 70, format: 'webp' },
    avatar: { width: 256, height: 256, quality: 80, format: 'webp' },
    preview: { width: 800, quality: 80, format: 'webp' },
    ogImage: { width: 1200, height: 630, quality: 90, format: 'jpeg' },
  },
};

export interface UploadedFile {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
  optimized?: {
    thumbnail?: string;
    avatar?: string;
    preview?: string;
    ogImage?: string;
  };
  createdAt: string;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

// Generate unique file ID
function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique stored filename
function generateStoredName(originalName: string, format?: string): string {
  const ext = format || originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `${baseName}_${timestamp}_${random}.${ext}`;
}

// Validate file type
export function validateFileType(mimeType: string, category: keyof typeof UPLOAD_CONFIG.allowedTypes = 'images'): boolean {
  return UPLOAD_CONFIG.allowedTypes[category].includes(mimeType);
}

// Validate file size
export function validateFileSize(size: number): boolean {
  return size <= UPLOAD_CONFIG.maxFileSize;
}

// Get file category
export function getFileCategory(mimeType: string): 'images' | 'documents' | 'spreadsheets' | 'unknown' {
  if (UPLOAD_CONFIG.allowedTypes.images.includes(mimeType)) return 'images';
  if (UPLOAD_CONFIG.allowedTypes.documents.includes(mimeType)) return 'documents';
  if (UPLOAD_CONFIG.allowedTypes.spreadsheets.includes(mimeType)) return 'spreadsheets';
  return 'unknown';
}

// Optimize image using Sharp
async function optimizeImage(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  try {
    const sharp = (await import('sharp')).default;

    let pipeline = sharp(buffer);

    // Resize if dimensions provided
    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width || null, options.height || null, {
        fit: options.fit || 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert format
    switch (options.format) {
      case 'webp':
        pipeline = pipeline.webp({ quality: options.quality || 80 });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: options.quality || 80, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 9 - Math.floor((options.quality || 80) / 12) });
        break;
    }

    const output = await pipeline.toBuffer({ resolveWithObject: true });

    return {
      buffer: output.data,
      width: output.info.width,
      height: output.info.height,
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Return original if optimization fails
    return {
      buffer,
      width: 0,
      height: 0,
    };
  }
}

// Generate optimized variants
async function generateOptimizedVariants(
  originalBuffer: Buffer,
  baseName: string,
  mimeType: string
): Promise<Record<string, string>> {
  const variants: Record<string, string> = {};

  if (!mimeType.startsWith('image/') || mimeType === 'image/gif') {
    return variants; // Don't optimize non-images or GIFs
  }

  for (const [presetName, presetOptions] of Object.entries(UPLOAD_CONFIG.presets)) {
    try {
      const format = presetOptions.format as 'webp' | 'jpeg' | 'png' | undefined;
      const optimized = await optimizeImage(originalBuffer, { ...presetOptions, format });
      const ext = format || 'webp';
      const variantName = `${baseName}_${presetName}.${ext}`;

      // Upload variant
      if (isSupabaseConfigured()) {
        const { data } = await supabase.storage
          .from('uploads')
          .upload(`optimized/${variantName}`, optimized.buffer, {
            contentType: `image/${ext}`,
            cacheControl: '31536000',
          });

        if (data) {
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(`optimized/${variantName}`);
          variants[presetName] = urlData.publicUrl;
        }
      } else {
        // Local storage fallback
        variants[presetName] = `/uploads/optimized/${variantName}`;
      }
    } catch (error) {
      console.error(`Failed to generate ${presetName} variant:`, error);
    }
  }

  return variants;
}

// Get image dimensions
async function getImageDimensionsFromBuffer(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch {
    return { width: 0, height: 0 };
  }
}

// Upload to Supabase Storage
async function uploadToSupabase(
  buffer: Buffer,
  storedName: string,
  mimeType: string,
  folder: string = 'general'
): Promise<{ url: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${folder}/${storedName}`, buffer, {
        contentType: mimeType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      return { url: '', error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(`${folder}/${storedName}`);

    return { url: urlData.publicUrl };
  } catch (error) {
    return { url: '', error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Upload to local storage (development)
async function uploadToLocal(
  buffer: Buffer,
  storedName: string,
  folder: string
): Promise<{ url: string; path: string; error?: string }> {
  try {
    const fs = require('fs');
    const path = require('path');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filePath = path.join(uploadDir, storedName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${folder}/${storedName}`,
      path: filePath,
    };
  } catch (error) {
    return { url: '', path: '', error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Create file record in database
async function createFileRecord(fileData: Partial<UploadedFile>): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const id = generateFileId();

  try {
    const { error } = await supabase.from('files').insert({
      id,
      original_name: fileData.originalName,
      stored_name: fileData.storedName,
      mime_type: fileData.mimeType,
      size: fileData.size,
      url: fileData.url,
      width: fileData.width,
      height: fileData.height,
    });

    if (error) {
      console.error('Failed to create file record:', error);
      return null;
    }

    return id;
  } catch (error) {
    console.error('Failed to create file record:', error);
    return null;
  }
}

// Main upload function with optimization
export async function uploadFile(
  file: File,
  options: {
    folder?: string;
    bucket?: string;
    userId?: string;
    category?: keyof typeof UPLOAD_CONFIG.allowedTypes;
    optimize?: boolean;
    generateVariants?: boolean;
  } = {}
): Promise<UploadResult> {
  const {
    folder = 'general',
    category = 'images',
    optimize = true,
    generateVariants = true,
  } = options;

  // Validate file type
  if (!validateFileType(file.type, category)) {
    return { success: false, error: `File type ${file.type} is not allowed` };
  }

  // Validate file size
  if (!validateFileSize(file.size)) {
    return { success: false, error: `File size exceeds ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB limit` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const mimeType = file.type;

  // Get original dimensions
  const originalDimensions = await getImageDimensionsFromBuffer(buffer);

  // Optimize if enabled and is an image
  let processedBuffer: Buffer = Buffer.from(buffer);
  let width = originalDimensions.width;
  let height = originalDimensions.height;

  if (optimize && mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') {
    try {
      const optimized = await optimizeImage(buffer, {
        width: UPLOAD_CONFIG.imageMaxDimensions.width,
        height: UPLOAD_CONFIG.imageMaxDimensions.height,
        quality: 85,
        format: 'webp', // Convert to webp for better compression
        fit: 'inside',
      });

      // Only use optimized if it's smaller
      if (optimized.buffer.length < buffer.length) {
        processedBuffer = Buffer.from(optimized.buffer) as Buffer;
        width = optimized.width;
        height = optimized.height;
      }
    } catch (error) {
      console.error('Image optimization failed, using original:', error);
    }
  }

  // Generate stored name
  const ext = mimeType.startsWith('image/') ? 'webp' : file.name.split('.').pop();
  const storedName = generateStoredName(file.name, ext);

  // Upload main file
  let url: string;

  if (isSupabaseConfigured()) {
    const result = await uploadToSupabase(processedBuffer, storedName, `image/${ext}`, folder);
    if (result.error) {
      return { success: false, error: result.error };
    }
    url = result.url;
  } else {
    const result = await uploadToLocal(processedBuffer, storedName, folder);
    if (result.error) {
      return { success: false, error: result.error };
    }
    url = result.url;
  }

  // Generate optimized variants
  let optimized: UploadedFile['optimized'] = undefined;

  if (generateVariants && mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') {
    try {
      optimized = await generateOptimizedVariants(buffer, baseName.replace(/[^a-zA-Z0-9]/g, '_'), mimeType);
    } catch (error) {
      console.error('Failed to generate variants:', error);
    }
  }

  // Create database record
  const fileId = await createFileRecord({
    originalName: file.name,
    storedName,
    mimeType: `image/${ext}`,
    size: processedBuffer.length,
    url,
    width,
    height,
  });

  return {
    success: true,
    file: {
      id: fileId || generateFileId(),
      originalName: file.name,
      storedName,
      mimeType: `image/${ext}`,
      size: processedBuffer.length,
      url,
      width,
      height,
      optimized,
      createdAt: new Date().toISOString(),
    },
  };
}

// Delete file
export async function deleteFile(fileId: string, fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (isSupabaseConfigured()) {
      // Extract path from URL
      const urlParts = fileUrl.split('/');
      const bucketIndex = urlParts.findIndex(p => p === 'uploads' || p === 'storage' || p === 'public');
      const path = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage.from('uploads').remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      // Delete record
      await supabase.from('files').delete().eq('id', fileId);
    } else {
      // Local delete
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', fileUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

// API Route Handler
export async function handleUpload(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'general';
    const category = (formData.get('category') as keyof typeof UPLOAD_CONFIG.allowedTypes) || 'images';
    const optimize = formData.get('optimize') !== 'false';
    const generateVariants = formData.get('generateVariants') !== 'false';

    // Validate file count
    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return NextResponse.json(
        { success: false, error: `Maximum ${UPLOAD_CONFIG.maxFiles} files allowed` },
        { status: 400 }
      );
    }

    // Upload files
    const results = await Promise.all(
      files.map(file => uploadFile(file, { folder, category, optimize, generateVariants }))
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      data: {
        files: successful.map(r => r.file),
        uploaded: successful.length,
        failed: failed.length,
      },
      errors: failed.map(f => f.error),
    }, {
      status: failed.length === 0 ? 200 : 207,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// Export configuration for client use
export const uploadConfig = UPLOAD_CONFIG;
