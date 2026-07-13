'use client';

/**
 * FileUpload Component
 * Drag and drop file upload with preview and validation
 */

import * as React from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function FileUpload({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  value = [],
  onChange,
  disabled,
  className,
  placeholder = 'Drag file di sini atau klik untuk upload',
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>(value);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  const validateFiles = (newFiles: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (maxSize && file.size > maxSize) {
        errors.push(`${file.name} terlalu besar (maks ${formatFileSize(maxSize)})`);
        continue;
      }

      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileType ||
            type === fileExtension ||
            (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '/')))
        );

        if (!isAccepted) {
          errors.push(`${file.name} tidak didukung`);
          continue;
        }
      }

      valid.push(file);
    }

    return { valid, errors };
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setValidationError(errors[0]);
      setTimeout(() => setValidationError(null), 3000);
    }

    if (valid.length > 0) {
      const totalFiles = [...files, ...valid].slice(0, maxFiles);
      setFiles(totalFiles);
      onChange?.(totalFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <div className={cn('space-y-3', className)}>
      {/* Dropzone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          'hover:border-primary/50 hover:bg-muted/50',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
          error || validationError ? 'border-destructive' : 'border-muted-foreground/25'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'p-3 rounded-full',
            isDragging ? 'bg-primary/10' : 'bg-muted'
          )}>
            <Upload className={cn(
              'h-6 w-6',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragging ? 'Lepaskan file di sini' : placeholder}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept && `Format: ${accept}`}
              {maxSize && ` • Maks ${formatFileSize(maxSize)}`}
              {maxFiles > 1 && ` • Maks ${maxFiles} file`}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {(error || validationError) && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error || validationError}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-shrink-0">
                {isImage(file) ? (
                  <div className="h-10 w-10 rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <File className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { FileUpload, formatFileSize };
