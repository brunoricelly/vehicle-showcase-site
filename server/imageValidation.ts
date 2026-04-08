/**
 * Image validation and optimization utilities
 * Validates image dimensions, file size, and format
 * Provides compression and optimization functions
 */

export interface ImageValidationConfig {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxFileSizeBytes?: number;
  allowedFormats?: string[];
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  format?: string;
}

/**
 * Default validation configuration for vehicle images
 */
export const DEFAULT_IMAGE_CONFIG: ImageValidationConfig = {
  minWidth: 400,
  minHeight: 300,
  maxWidth: 4000,
  maxHeight: 3000,
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedFormats: ["image/jpeg", "image/png", "image/webp"],
};

/**
 * Validates image dimensions and file size
 * Note: This is a synchronous validation that checks basic properties
 * For actual image dimension validation, use validateImageDimensions()
 */
export function validateImageBasics(
  fileBuffer: Buffer,
  mimeType: string,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): ImageValidationResult {
  // Validate file size
  if (config.maxFileSizeBytes && fileBuffer.length > config.maxFileSizeBytes) {
    const maxSizeMB = (config.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
    const actualSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB, Atual: ${actualSizeMB}MB`,
      fileSizeBytes: fileBuffer.length,
      format: mimeType,
    };
  }

  // Validate format
  if (config.allowedFormats && !config.allowedFormats.includes(mimeType)) {
    return {
      valid: false,
      error: `Formato não suportado. Formatos aceitos: ${config.allowedFormats.join(", ")}`,
      format: mimeType,
      fileSizeBytes: fileBuffer.length,
    };
  }

  return {
    valid: true,
    fileSizeBytes: fileBuffer.length,
    format: mimeType,
  };
}

/**
 * Validates image dimensions by parsing image headers
 * Supports JPEG, PNG, and WebP formats
 */
export function validateImageDimensions(
  fileBuffer: Buffer,
  mimeType: string,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): ImageValidationResult {
  // First validate basics
  const basicValidation = validateImageBasics(fileBuffer, mimeType, config);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  let width: number | undefined;
  let height: number | undefined;

  try {
    if (mimeType === "image/jpeg") {
      const dims = getJPEGDimensions(fileBuffer);
      width = dims.width;
      height = dims.height;
    } else if (mimeType === "image/png") {
      const dims = getPNGDimensions(fileBuffer);
      width = dims.width;
      height = dims.height;
    } else if (mimeType === "image/webp") {
      const dims = getWebPDimensions(fileBuffer);
      width = dims.width;
      height = dims.height;
    }
  } catch (error) {
    return {
      valid: false,
      error: "Não foi possível ler as dimensões da imagem. Arquivo pode estar corrompido.",
      fileSizeBytes: fileBuffer.length,
      format: mimeType,
    };
  }

  // Validate dimensions if we could read them
  if (width && height) {
    if (config.minWidth && width < config.minWidth) {
      return {
        valid: false,
        error: `Largura mínima: ${config.minWidth}px, Atual: ${width}px`,
        width,
        height,
        fileSizeBytes: fileBuffer.length,
        format: mimeType,
      };
    }

    if (config.minHeight && height < config.minHeight) {
      return {
        valid: false,
        error: `Altura mínima: ${config.minHeight}px, Atual: ${height}px`,
        width,
        height,
        fileSizeBytes: fileBuffer.length,
        format: mimeType,
      };
    }

    if (config.maxWidth && width > config.maxWidth) {
      return {
        valid: false,
        error: `Largura máxima: ${config.maxWidth}px, Atual: ${width}px`,
        width,
        height,
        fileSizeBytes: fileBuffer.length,
        format: mimeType,
      };
    }

    if (config.maxHeight && height > config.maxHeight) {
      return {
        valid: false,
        error: `Altura máxima: ${config.maxHeight}px, Atual: ${height}px`,
        width,
        height,
        fileSizeBytes: fileBuffer.length,
        format: mimeType,
      };
    }
  }

  return {
    valid: true,
    width,
    height,
    fileSizeBytes: fileBuffer.length,
    format: mimeType,
  };
}

/**
 * Extracts dimensions from JPEG file
 * Reads JPEG markers to find SOF (Start of Frame) marker
 */
function getJPEGDimensions(buffer: Buffer): { width: number; height: number } {
  let offset = 2; // Skip SOI marker (0xFFD8)

  while (offset < buffer.length) {
    // Look for marker
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;

    // SOF markers (Start of Frame) contain image dimensions
    // SOF0=0xC0, SOF1=0xC1, SOF2=0xC2, SOF9=0xC9, SOF10=0xCA
    if ([0xc0, 0xc1, 0xc2, 0xc9, 0xca].includes(marker)) {
      // Skip length (2 bytes) and precision (1 byte)
      offset += 3;
      // Read height (2 bytes) and width (2 bytes)
      const height = (buffer[offset] << 8) | buffer[offset + 1];
      const width = (buffer[offset + 2] << 8) | buffer[offset + 3];
      return { width, height };
    }

    // Skip to next marker
    const length = (buffer[offset] << 8) | buffer[offset + 1];
    offset += length;
  }

  throw new Error("Could not find JPEG dimensions");
}

/**
 * Extracts dimensions from PNG file
 * PNG dimensions are in the IHDR chunk (first 8 bytes after PNG signature)
 */
function getPNGDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG signature is 8 bytes: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length < 24) {
    throw new Error("PNG file too small");
  }

  // IHDR chunk starts at byte 8
  // Bytes 16-19 contain width, bytes 20-23 contain height
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

/**
 * Extracts dimensions from WebP file
 * WebP format has VP8/VP8L/VP8X chunks
 */
function getWebPDimensions(buffer: Buffer): { width: number; height: number } {
  // WebP signature: "RIFF" at 0, "WEBP" at 8
  if (buffer.length < 30) {
    throw new Error("WebP file too small");
  }

  // Check for VP8 (lossy) chunk
  if (buffer.toString("ascii", 12, 15) === "VP8") {
    // VP8 bitstream: dimensions are at offset 6-9 (width and height)
    // The dimensions are stored as 14-bit values
    const w = ((buffer[9] << 8) | buffer[8]) & 0x3fff;
    const h = ((buffer[11] << 8) | buffer[10]) & 0x3fff;
    return { width: w + 1, height: h + 1 };
  }

  // Check for VP8L (lossless) chunk
  if (buffer.toString("ascii", 12, 16) === "VP8L") {
    // VP8L has 5 bytes of header, dimensions are in next 4 bytes
    const bits = buffer.readUInt32LE(16);
    const width = ((bits & 0x3fff) + 1) as number;
    const height = (((bits >> 14) & 0x3fff) + 1) as number;
    return { width, height };
  }

  // Check for VP8X (extended) chunk
  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    // VP8X: width is at offset 20-22 (24-bit), height at 23-25
    const width = (buffer[20] | (buffer[21] << 8) | (buffer[22] << 16)) + 1;
    const height = (buffer[23] | (buffer[24] << 8) | (buffer[25] << 16)) + 1;
    return { width, height };
  }

  throw new Error("Could not find WebP dimensions");
}

/**
 * Calculates optimal compression quality based on image size
 * Larger images get more aggressive compression
 */
export function calculateCompressionQuality(
  width: number,
  height: number
): number {
  const megapixels = (width * height) / 1000000;

  if (megapixels > 10) return 0.7; // High MP: 70% quality
  if (megapixels > 5) return 0.75; // Medium-high MP: 75% quality
  if (megapixels > 2) return 0.8; // Medium MP: 80% quality
  return 0.85; // Low MP: 85% quality
}

/**
 * Generates a human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
