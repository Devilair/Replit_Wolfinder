import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

/**
 * Enterprise File Upload Manager
 * Handles secure file upload, validation, storage, and cleanup
 */
export class FileUploadManager {
  private readonly UPLOAD_DIR = 'uploads';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/tiff'
  ];

  private readonly ALLOWED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx', '.tiff'
  ];

  constructor() {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
      console.log(`📁 Created upload directory: ${this.UPLOAD_DIR}`);
    }
  }

  /**
   * Generate secure filename with hash
   */
  private generateSecureFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `${timestamp}_${randomBytes}${ext}`;
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`
      };
    }

    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} not allowed. Allowed extensions: ${this.ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Create multer middleware for file uploads
   */
  createUploadMiddleware(field: string = 'file', maxFiles: number = 1) {
    const storage = multer.memoryStorage();

    return multer({
      storage,
      limits: {
        fileSize: this.MAX_FILE_SIZE,
        files: maxFiles
      },
      fileFilter: (req, file, cb) => {
        const validation = this.validateFile(file);
        if (validation.valid) {
          cb(null, true);
        } else {
          cb(new Error(validation.error), false);
        }
      }
    }).single(field);
  }

  /**
   * Save uploaded file to disk
   */
  async saveFile(file: Express.Multer.File): Promise<{
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    path: string;
  }> {
    const secureFilename = this.generateSecureFilename(file.originalname);
    const filePath = path.join(this.UPLOAD_DIR, secureFilename);

    await fs.writeFile(filePath, file.buffer);

    console.log(`💾 File saved: ${secureFilename} (${(file.size / 1024).toFixed(2)}KB)`);

    return {
      filename: secureFilename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: filePath
    };
  }

  /**
   * Delete file from disk
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, filename);
      await fs.unlink(filePath);
      console.log(`🗑️ File deleted: ${filename}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${filename}:`, error);
      return false;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filename: string): Promise<{
    exists: boolean;
    size?: number;
    stats?: any;
  }> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, filename);
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        stats
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Clean up old files (older than specified days)
   */
  async cleanupOldFiles(maxAgeInDays: number = 30): Promise<{
    deletedCount: number;
    errors: string[];
  }> {
    const cutoffDate = new Date(Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000));
    let deletedCount = 0;
    const errors: string[] = [];

    try {
      const files = await fs.readdir(this.UPLOAD_DIR);
      
      for (const file of files) {
        try {
          const filePath = path.join(this.UPLOAD_DIR, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            deletedCount++;
            console.log(`🧹 Cleaned up old file: ${file}`);
          }
        } catch (error) {
          errors.push(`Failed to process ${file}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to read upload directory: ${error}`);
    }

    return { deletedCount, errors };
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageSize: number;
    oldestFile?: string;
    newestFile?: string;
  }> {
    try {
      const files = await fs.readdir(this.UPLOAD_DIR);
      let totalSize = 0;
      let oldestTime = Date.now();
      let newestTime = 0;
      let oldestFile = '';
      let newestFile = '';

      for (const file of files) {
        try {
          const filePath = path.join(this.UPLOAD_DIR, file);
          const stats = await fs.stat(filePath);
          
          totalSize += stats.size;
          
          if (stats.mtime.getTime() < oldestTime) {
            oldestTime = stats.mtime.getTime();
            oldestFile = file;
          }
          
          if (stats.mtime.getTime() > newestTime) {
            newestTime = stats.mtime.getTime();
            newestFile = file;
          }
        } catch {
          // Skip files that can't be accessed
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        averageSize: files.length > 0 ? totalSize / files.length : 0,
        oldestFile: oldestFile || undefined,
        newestFile: newestFile || undefined
      };
    } catch {
      return {
        totalFiles: 0,
        totalSize: 0,
        averageSize: 0
      };
    }
  }

  /**
   * Test file upload functionality
   */
  async runTests(): Promise<{
    validation: { success: boolean; message: string };
    storage: { success: boolean; message: string };
    cleanup: { success: boolean; message: string };
    overallSuccess: boolean;
  }> {
    // Test 1: File validation
    const testFile: Express.Multer.File = {
      fieldname: 'test',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: ''
    };

    const validation = this.validateFile(testFile);
    
    // Test 2: File storage
    let storageTest = { success: false, message: 'Not tested' };
    let cleanupTest = { success: false, message: 'Not tested' };

    if (validation.valid) {
      try {
        const savedFile = await this.saveFile(testFile);
        storageTest = { success: true, message: `File saved as ${savedFile.filename}` };
        
        // Test 3: File cleanup
        const deleted = await this.deleteFile(savedFile.filename);
        cleanupTest = { success: deleted, message: deleted ? 'File deleted successfully' : 'Failed to delete file' };
      } catch (error) {
        storageTest = { success: false, message: `Storage failed: ${error}` };
      }
    }

    const overallSuccess = validation.valid && storageTest.success && cleanupTest.success;

    return {
      validation: { success: validation.valid, message: validation.error || 'Validation passed' },
      storage: storageTest,
      cleanup: cleanupTest,
      overallSuccess
    };
  }
}

export const fileUploadManager = new FileUploadManager();