import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Cloud Storage Service for File Management
 * Provides unified interface for local and cloud storage operations
 * Ready for S3/R2 integration when needed
 */

export interface StorageFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface UploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  metadata?: Record<string, any>;
}

export interface StorageProvider {
  upload(buffer: Buffer, filename: string, options?: UploadOptions): Promise<StorageFile>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<boolean>;
  getUrl(fileId: string): string;
  exists(fileId: string): Promise<boolean>;
}

/**
 * Local Storage Provider
 * Production-ready local storage with proper security and organization
 */
class LocalStorageProvider implements StorageProvider {
  private basePath: string;
  private baseUrl: string;

  constructor(basePath: string = './uploads', baseUrl: string = '/api/files') {
    this.basePath = basePath;
    this.baseUrl = baseUrl;
    this.ensureDirectory();
  }

  private async ensureDirectory() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }

  private generateFileId(originalName: string, buffer: Buffer): string {
    const hash = createHash('sha256').update(buffer).digest('hex').substring(0, 16);
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    return `${timestamp}_${hash}${ext}`;
  }

  private getFilePath(fileId: string): string {
    // Organize files in subdirectories by date
    const date = new Date().toISOString().slice(0, 7); // YYYY-MM
    const folder = path.join(this.basePath, date);
    return path.join(folder, fileId);
  }

  async upload(buffer: Buffer, filename: string, options: UploadOptions = {}): Promise<StorageFile> {
    // Validate file size
    if (options.maxSize && buffer.length > options.maxSize) {
      throw new Error(`File size ${buffer.length} exceeds limit ${options.maxSize}`);
    }

    // Validate file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const ext = path.extname(filename).toLowerCase();
      if (!options.allowedTypes.includes(ext)) {
        throw new Error(`File type ${ext} not allowed`);
      }
    }

    const fileId = this.generateFileId(filename, buffer);
    const filePath = this.getFilePath(fileId);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, buffer);

    // Detect MIME type from extension
    const mimeType = this.getMimeType(path.extname(filename));

    const storageFile: StorageFile = {
      id: fileId,
      originalName: filename,
      mimeType,
      size: buffer.length,
      url: `${this.baseUrl}/${fileId}`,
      uploadedAt: new Date(),
      metadata: options.metadata
    };

    console.log(`📁 File uploaded: ${filename} -> ${fileId} (${buffer.length} bytes)`);
    return storageFile;
  }

  async download(fileId: string): Promise<Buffer> {
    const filePath = this.getFilePath(fileId);
    
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`File not found: ${fileId}`);
    }
  }

  async delete(fileId: string): Promise<boolean> {
    const filePath = this.getFilePath(fileId);
    
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ File deleted: ${fileId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${fileId}:`, error);
      return false;
    }
  }

  getUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}`;
  }

  async exists(fileId: string): Promise<boolean> {
    const filePath = this.getFilePath(fileId);
    
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.tiff': 'image/tiff',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

/**
 * S3/R2 Storage Provider (Ready for implementation)
 * Scalable cloud storage for production environments
 */
class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint?: string;

  constructor(config: {
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
    endpoint?: string;
  }) {
    this.bucket = config.bucket;
    this.region = config.region;
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.endpoint = config.endpoint;
  }

  async upload(buffer: Buffer, filename: string, options: UploadOptions = {}): Promise<StorageFile> {
    // TODO: Implement S3 upload
    throw new Error('S3 storage not yet implemented. Use LOCAL storage for now.');
  }

  async download(fileId: string): Promise<Buffer> {
    // TODO: Implement S3 download
    throw new Error('S3 storage not yet implemented. Use LOCAL storage for now.');
  }

  async delete(fileId: string): Promise<boolean> {
    // TODO: Implement S3 delete
    throw new Error('S3 storage not yet implemented. Use LOCAL storage for now.');
  }

  getUrl(fileId: string): string {
    // TODO: Return S3 URL
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileId}`;
  }

  async exists(fileId: string): Promise<boolean> {
    // TODO: Implement S3 exists check
    throw new Error('S3 storage not yet implemented. Use LOCAL storage for now.');
  }
}

/**
 * Cloud Storage Manager
 * Unified interface with fallback and monitoring capabilities
 */
export class CloudStorageManager {
  private primaryProvider: StorageProvider;
  private fallbackProvider?: StorageProvider;
  private uploadStats = {
    totalUploads: 0,
    totalSize: 0,
    successfulUploads: 0,
    failedUploads: 0
  };

  constructor(primary: StorageProvider, fallback?: StorageProvider) {
    this.primaryProvider = primary;
    this.fallbackProvider = fallback;
  }

  async upload(buffer: Buffer, filename: string, options: UploadOptions = {}): Promise<StorageFile> {
    const startTime = Date.now();
    
    try {
      this.uploadStats.totalUploads++;
      this.uploadStats.totalSize += buffer.length;
      
      const result = await this.primaryProvider.upload(buffer, filename, options);
      
      this.uploadStats.successfulUploads++;
      const duration = Date.now() - startTime;
      
      console.log(`☁️ Upload successful: ${filename} in ${duration}ms`);
      return result;
      
    } catch (error) {
      this.uploadStats.failedUploads++;
      console.error('Primary storage failed:', error);
      
      // Try fallback if available
      if (this.fallbackProvider) {
        console.log('🔄 Attempting fallback storage...');
        try {
          return await this.fallbackProvider.upload(buffer, filename, options);
        } catch (fallbackError) {
          console.error('Fallback storage also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  async download(fileId: string): Promise<Buffer> {
    try {
      return await this.primaryProvider.download(fileId);
    } catch (error) {
      if (this.fallbackProvider) {
        console.log('🔄 Attempting fallback download...');
        return await this.fallbackProvider.download(fileId);
      }
      throw error;
    }
  }

  async delete(fileId: string): Promise<boolean> {
    const primaryResult = await this.primaryProvider.delete(fileId);
    
    // Also delete from fallback if it exists
    if (this.fallbackProvider) {
      try {
        await this.fallbackProvider.delete(fileId);
      } catch (error) {
        console.warn('Failed to delete from fallback storage:', error);
      }
    }
    
    return primaryResult;
  }

  getUrl(fileId: string): string {
    return this.primaryProvider.getUrl(fileId);
  }

  async exists(fileId: string): Promise<boolean> {
    const existsInPrimary = await this.primaryProvider.exists(fileId);
    if (existsInPrimary) return true;
    
    if (this.fallbackProvider) {
      return await this.fallbackProvider.exists(fileId);
    }
    
    return false;
  }

  getStats() {
    return { ...this.uploadStats };
  }

  resetStats() {
    this.uploadStats = {
      totalUploads: 0,
      totalSize: 0,
      successfulUploads: 0,
      failedUploads: 0
    };
  }
}

// Factory function for creating storage instances
export function createStorageManager(type: 'local' | 's3' = 'local'): CloudStorageManager {
  if (type === 's3') {
    // S3 configuration would come from environment variables
    const s3Config = {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKey: process.env.S3_ACCESS_KEY || '',
      secretKey: process.env.S3_SECRET_KEY || '',
      endpoint: process.env.S3_ENDPOINT // For Cloudflare R2
    };
    
    const primary = new S3StorageProvider(s3Config);
    const fallback = new LocalStorageProvider(); // Local as fallback
    
    return new CloudStorageManager(primary, fallback);
  }
  
  // Default to local storage
  const primary = new LocalStorageProvider();
  return new CloudStorageManager(primary);
}

// Export default instance
export const cloudStorage = createStorageManager('local');
export default cloudStorage;