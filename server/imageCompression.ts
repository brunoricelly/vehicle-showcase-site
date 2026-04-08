/**
 * Image compression utilities with adaptive quality based on resolution
 * Uses Sharp for efficient image processing
 */

import sharp from "sharp";

export interface CompressionConfig {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: "jpeg" | "webp" | "png";
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
  quality: number;
  format: string;
  compressionRatio: number;
  buffer: Buffer;
}

/**
 * Calculate optimal quality based on megapixels
 * Higher resolution images can use lower quality without visible loss
 */
export function calculateAdaptiveQuality(
  width: number,
  height: number,
  targetQuality?: number
): number {
  if (targetQuality !== undefined) {
    return Math.max(30, Math.min(95, targetQuality));
  }

  const megapixels = (width * height) / 1000000;

  // Adaptive quality based on resolution
  if (megapixels > 20) {
    // 4K+ images: lower quality acceptable
    return 65;
  } else if (megapixels > 12) {
    // 2K+ images: medium quality
    return 72;
  } else if (megapixels > 6) {
    // 1080p+ images: good quality
    return 78;
  } else {
    // Lower resolution: preserve quality
    return 85;
  }
}

/**
 * Calculate optimal dimensions for web display
 * Reduces file size while maintaining visual quality
 */
export function calculateOptimalDimensions(
  width: number,
  height: number,
  maxWidth: number = 2560
): { width: number; height: number } {
  if (width <= maxWidth) {
    return { width, height };
  }

  const ratio = height / width;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * ratio),
  };
}

/**
 * Compress image with adaptive quality and optional resizing
 * Supports JPEG, WebP, and PNG formats
 */
export async function compressImage(
  imageBuffer: Buffer,
  mimeType: string,
  config: CompressionConfig = {}
): Promise<CompressionResult> {
  try {
    // Get original metadata
    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    const originalSize = imageBuffer.length;

    // Calculate adaptive quality
    const quality = calculateAdaptiveQuality(
      originalWidth,
      originalHeight,
      config.quality
    );

    // Calculate optimal dimensions
    const optimalDims = calculateOptimalDimensions(
      originalWidth,
      originalHeight,
      config.maxWidth || 2560
    );

    // Determine output format
    const outputFormat = config.format || getOptimalFormat(mimeType);

    // Compress image
    let pipeline = sharp(imageBuffer).resize(optimalDims.width, optimalDims.height, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (outputFormat === "webp") {
      pipeline = pipeline.webp({ quality, effort: 6 });
    } else if (outputFormat === "jpeg") {
      pipeline = pipeline.jpeg({ quality, progressive: true });
    } else {
      pipeline = pipeline.png({ compressionLevel: 9 });
    }

    const compressedBuffer = await pipeline.toBuffer();
    const compressedSize = compressedBuffer.length;

    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    return {
      originalSize,
      compressedSize,
      originalDimensions: { width: originalWidth, height: originalHeight },
      compressedDimensions: optimalDims,
      quality,
      format: outputFormat,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      buffer: compressedBuffer,
    };
  } catch (error) {
    throw new Error(
      `Erro ao comprimir imagem: ${error instanceof Error ? error.message : "Desconhecido"}`
    );
  }
}

/**
 * Determine optimal format based on original MIME type and file size
 * WebP is preferred for modern browsers, JPEG as fallback
 */
export function getOptimalFormat(
  mimeType: string
): "jpeg" | "webp" | "png" {
  if (mimeType === "image/png") {
    return "png";
  }
  // Default to WebP for better compression, JPEG as fallback
  return "webp";
}

/**
 * Create multiple optimized versions of an image for different use cases
 */
export async function createOptimizedVersions(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{
  thumbnail: CompressionResult; // 300x300 for thumbnails
  medium: CompressionResult; // 800x600 for previews
  large: CompressionResult; // 1920x1440 for full view
  original: CompressionResult; // Full resolution compressed
}> {
  const [thumbnail, medium, large, original] = await Promise.all([
    compressImage(imageBuffer, mimeType, {
      maxWidth: 300,
      quality: 70,
      format: "webp",
    }),
    compressImage(imageBuffer, mimeType, {
      maxWidth: 800,
      quality: 75,
      format: "webp",
    }),
    compressImage(imageBuffer, mimeType, {
      maxWidth: 1920,
      quality: 80,
      format: "webp",
    }),
    compressImage(imageBuffer, mimeType, {
      maxWidth: 2560,
      quality: 85,
      format: "webp",
    }),
  ]);

  return { thumbnail, medium, large, original };
}

/**
 * Format compression statistics for logging/display
 */
export function formatCompressionStats(result: CompressionResult): string {
  const originalMB = (result.originalSize / (1024 * 1024)).toFixed(2);
  const compressedMB = (result.compressedSize / (1024 * 1024)).toFixed(2);

  return (
    `Compressão: ${originalMB}MB → ${compressedMB}MB ` +
    `(${result.compressionRatio}% redução) | ` +
    `Qualidade: ${result.quality} | ` +
    `Dimensões: ${result.originalDimensions.width}x${result.originalDimensions.height} → ` +
    `${result.compressedDimensions.width}x${result.compressedDimensions.height}`
  );
}

/**
 * Estimate file size after compression without actually compressing
 * Useful for showing users expected file size
 */
export function estimateCompressedSize(
  originalSize: number,
  megapixels: number
): number {
  // Empirical formula based on compression ratios
  // Higher megapixels = better compression ratio
  let ratio = 0.4; // Default 40% of original

  if (megapixels > 20) {
    ratio = 0.25; // 4K: ~25%
  } else if (megapixels > 12) {
    ratio = 0.3; // 2K: ~30%
  } else if (megapixels > 6) {
    ratio = 0.35; // 1080p: ~35%
  }

  return Math.round(originalSize * ratio);
}
