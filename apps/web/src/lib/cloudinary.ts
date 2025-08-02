import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  access_mode: string;
  original_filename: string;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadToCloudinary(
  file: string, // base64 data URI or file path
  publicId?: string,
  options?: {
    folder?: string;
    transformation?: any;
    tags?: string[];
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<CloudinaryUploadResult> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const uploadOptions: any = {
      public_id: publicId,
      folder: options?.folder || 'crops-ai',
      resource_type: options?.resource_type || 'auto',
      tags: options?.tags || ['satellite', 'agriculture'],
    };

    if (options?.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<{ result: string }> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a transformation URL for an image
 */
export function generateCloudinaryUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
    gravity?: string;
  }
): string {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is missing');
    }

    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });
  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    return '';
  }
}

/**
 * Get image info from Cloudinary
 */
export async function getCloudinaryImageInfo(publicId: string): Promise<any> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary info error:', error);
    throw new Error(`Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a thumbnail transformation URL
 */
export function createThumbnailUrl(
  publicId: string,
  size: number = 200,
  quality: string | number = 'auto'
): string {
  return generateCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality,
    format: 'auto',
    gravity: 'center',
  });
}

/**
 * Optimize image for web delivery
 */
export function optimizeForWeb(
  publicId: string,
  maxWidth: number = 1200,
  quality: string | number = 'auto'
): string {
  return generateCloudinaryUrl(publicId, {
    width: maxWidth,
    crop: 'scale',
    quality,
    format: 'auto',
  });
}

export default cloudinary;