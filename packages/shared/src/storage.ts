// File storage utilities for Cloudinary and AWS S3

interface UploadResult {
  url: string
  publicId?: string
  key?: string
}

interface UploadOptions {
  folder?: string
  quality?: string
  format?: string
  transformation?: any
}

// Cloudinary configuration
export class CloudinaryService {
  private static cloudName = process.env.CLOUDINARY_CLOUD_NAME
  private static apiKey = process.env.CLOUDINARY_API_KEY
  private static apiSecret = process.env.CLOUDINARY_API_SECRET

  static async uploadImage(
    file: File | Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // Implementation will be added when we integrate Cloudinary SDK
    throw new Error('Cloudinary upload not implemented yet')
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    // Implementation will be added when we integrate Cloudinary SDK
    throw new Error('Cloudinary delete not implemented yet')
  }

  static generateUrl(publicId: string, transformation?: any): string {
    if (!CloudinaryService.cloudName) {
      throw new Error('Cloudinary cloud name not configured')
    }
    
    const baseUrl = `https://res.cloudinary.com/${CloudinaryService.cloudName}/image/upload`
    
    if (transformation) {
      // Build transformation string
      const transformStr = Object.entries(transformation)
        .map(([key, value]) => `${key}_${value}`)
        .join(',')
      return `${baseUrl}/${transformStr}/${publicId}`
    }
    
    return `${baseUrl}/${publicId}`
  }
}

// AWS S3 configuration (alternative to Cloudinary)
export class S3Service {
  private static region = process.env.AWS_REGION || 'us-east-1'
  private static bucket = process.env.AWS_S3_BUCKET
  private static accessKeyId = process.env.AWS_ACCESS_KEY_ID
  private static secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  static async uploadFile(
    file: File | Buffer,
    key: string,
    options: { contentType?: string } = {}
  ): Promise<UploadResult> {
    // Implementation will be added when we integrate AWS SDK
    throw new Error('S3 upload not implemented yet')
  }

  static async deleteFile(key: string): Promise<boolean> {
    // Implementation will be added when we integrate AWS SDK
    throw new Error('S3 delete not implemented yet')
  }

  static generateUrl(key: string): string {
    if (!S3Service.bucket) {
      throw new Error('S3 bucket not configured')
    }
    return `https://${S3Service.bucket}.s3.${S3Service.region}.amazonaws.com/${key}`
  }
}

// Unified storage service that can use either Cloudinary or S3
export class StorageService {
  private static provider: 'cloudinary' | 's3' = 
    process.env.STORAGE_PROVIDER as 'cloudinary' | 's3' || 'cloudinary'

  static async uploadImage(
    file: File | Buffer | string,
    options: UploadOptions & { key?: string } = {}
  ): Promise<UploadResult> {
    if (StorageService.provider === 'cloudinary') {
      return CloudinaryService.uploadImage(file, options)
    } else {
      const key = options.key || `uploads/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return S3Service.uploadFile(file as File | Buffer, key, {
        contentType: options.format ? `image/${options.format}` : 'image/jpeg'
      })
    }
  }

  static async deleteImage(identifier: string): Promise<boolean> {
    if (StorageService.provider === 'cloudinary') {
      return CloudinaryService.deleteImage(identifier)
    } else {
      return S3Service.deleteFile(identifier)
    }
  }

  static generateUrl(identifier: string, transformation?: any): string {
    if (StorageService.provider === 'cloudinary') {
      return CloudinaryService.generateUrl(identifier, transformation)
    } else {
      return S3Service.generateUrl(identifier)
    }
  }
}

// File validation utilities
export class FileValidator {
  static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv', 'application/json']
  static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
  static readonly MAX_DOCUMENT_SIZE = 50 * 1024 * 1024 // 50MB

  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!FileValidator.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
    }

    if (file.size > FileValidator.MAX_IMAGE_SIZE) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' }
    }

    return { valid: true }
  }

  static validateDocumentFile(file: File): { valid: boolean; error?: string } {
    if (!FileValidator.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only PDF, CSV, and JSON are allowed.' }
    }

    if (file.size > FileValidator.MAX_DOCUMENT_SIZE) {
      return { valid: false, error: 'File too large. Maximum size is 50MB.' }
    }

    return { valid: true }
  }
}