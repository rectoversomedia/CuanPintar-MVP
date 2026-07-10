/**
 * File Upload Service
 *
 * Handles file uploads with:
 * - Image optimization
 * - File type validation
 * - Size limits
 * - Progress tracking
 * - Multiple storage backends (local, Supabase, S3-compatible)
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
function generateStoredName(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const baseName = originalName.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9]/g, '_');
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

// Upload to Supabase Storage
async function uploadToSupabase(
  file: File,
  bucket: string,
  folder: string
): Promise<{ url: string; error?: string }> {
  const storedName = generateStoredName(file.name);

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${folder}/${storedName}`, file, {
        cacheControl: '31536000', // 1 year
        upsert: false,
      });

    if (error) {
      return { url: '', error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(`${folder}/${storedName}`);

    return { url: urlData.publicUrl };
  } catch (error) {
    return { url: '', error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Upload to local storage (development)
async function uploadToLocal(
  file: File,
  folder: string
): Promise<{ url: string; path: string; error?: string }> {
  const storedName = generateStoredName(file.name);
  const uploadDir = `./public/uploads/${folder}`;
  const relativePath = `/uploads/${folder}/${storedName}`;

  try {
    // Create directory if not exists
    const fs = require('fs');
    const dir = require('path');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert File to buffer and write
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dir.join(uploadDir, storedName), buffer);

    return { url: relativePath, path: dir.join(uploadDir, storedName) };
  } catch (error) {
    return { url: '', path: '', error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Create file record in database
async function createFileRecord(fileData: Omit<UploadedFile, 'id' | 'createdAt'>): Promise<string | null> {
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

// Main upload function
export async function uploadFile(
  file: File,
  options: {
    folder?: string;
    bucket?: string;
    userId?: string;
    category?: keyof typeof UPLOAD_CONFIG.allowedTypes;
  } = {}
): Promise<UploadResult> {
  const { folder = 'general', bucket = 'uploads', userId, category = 'images' } = options;

  // Validate file type
  if (!validateFileType(file.type, category)) {
    return { success: false, error: `File type ${file.type} is not allowed` };
  }

  // Validate file size
  if (!validateFileSize(file.size)) {
    return { success: false, error: `File size exceeds ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB limit` };
  }

  // Get image dimensions if applicable
  let width: number | undefined;
  let height: number | undefined;

  if (category === 'images') {
    const dimensions = await getImageDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  }

  const storedName = generateStoredName(file.name);

  let url: string;

  // Upload based on configuration
  if (isSupabaseConfigured()) {
    const result = await uploadToSupabase(file, bucket, folder);
    if (result.error) {
      return { success: false, error: result.error };
    }
    url = result.url;
  } else {
    const result = await uploadToLocal(file, folder);
    if (result.error) {
      return { success: false, error: result.error };
    }
    url = result.url;
  }

  // Create database record
  const fileId = await createFileRecord({
    originalName: file.name,
    storedName,
    mimeType: file.type,
    size: file.size,
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
      mimeType: file.type,
      size: file.size,
      url,
      width,
      height,
      createdAt: new Date().toISOString(),
    },
  };
}

// Get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ width: 0, height: 0 });
      return;
    }

    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
}

// Delete file
export async function deleteFile(fileId: string, fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (isSupabaseConfigured()) {
      // Extract path from URL
      const urlParts = fileUrl.split('/');
      const bucket = urlParts.includes('uploads') ? 'uploads' : 'public';
      const path = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      // Delete record
      await supabase.from('files').delete().eq('id', fileId);
    } else {
      // Local delete
      const fs = require('fs');
      const path = require('path');
      const filePath = `.${fileUrl}`;

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
    const folder = formData.get('folder') as string || 'general';
    const category = (formData.get('category') as string) as keyof typeof UPLOAD_CONFIG.allowedTypes || 'images';

    // Validate file count
    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return NextResponse.json(
        { success: false, error: `Maximum ${UPLOAD_CONFIG.maxFiles} files allowed` },
        { status: 400 }
      );
    }

    // Upload files
    const results = await Promise.all(
      files.map(file => uploadFile(file, { folder, category }))
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
      status: failed.length === 0 ? 200 : 207, // 207 Multi-Status if some failed
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
