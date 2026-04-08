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
  minWidth: 0, // Sem limite mínimo
  minHeight: 0, // Sem limite mínimo
  maxWidth: 8000,
  maxHeight: 6000,
  maxFileSizeBytes: 20 * 1024 * 1024, // 20MB
  allowedFormats: ["image/jpeg", "image/png", "image/webp"],
};

/**
 * Configuração de imagens para padrão moderno (2024+)
 * - Mínimo: sem limite
 * - Máximo: 8000x6000 (4K e além)
 * - Tamanho: até 20MB para alta qualidade
 */

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
  // Validate MIME type
  if (config.allowedFormats && !config.allowedFormats.includes(mimeType)) {
    return {
      valid: false,
      error: `Formato não suportado. Formatos aceitos: ${config.allowedFormats.join(", ")}`,
      fileSizeBytes: fileBuffer.length,
      format: mimeType,
    };
  }

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

    return {
      valid: true,
      width,
      height,
      fileSizeBytes: fileBuffer.length,
      format: mimeType,
    };
  }

  return {
    valid: false,
    error: "Não foi possível determinar as dimensões da imagem",
    fileSizeBytes: fileBuffer.length,
    format: mimeType,
  };
}

/**
 * Extracts dimensions from JPEG file
 * Reads JPEG markers to find SOF (Start of Frame) marker
 */
function getJPEGDimensions(buffer: Buffer): { width: number; height: number } {
  // JPEG must start with FFD8 (SOI marker)
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Invalid JPEG file");
  }

  let offset = 2; // Skip SOI marker (0xFFD8)
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops

  while (offset < buffer.length - 8 && attempts < maxAttempts) {
    attempts++;

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
      if (offset + 3 >= buffer.length) break;
      offset += 3;

      // Read height (2 bytes) and width (2 bytes)
      const height = (buffer[offset] << 8) | buffer[offset + 1];
      const width = (buffer[offset + 2] << 8) | buffer[offset + 3];

      // Validate dimensions are reasonable
      if (width === 0 || height === 0 || width > 100000 || height > 100000) {
        throw new Error("Invalid JPEG dimensions");
      }

      return { width, height };
    }

    // Skip to next marker safely
    if (offset + 1 >= buffer.length) break;
    const length = (buffer[offset] << 8) | buffer[offset + 1];
    if (length < 2 || length > buffer.length) break; // Invalid length
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

  // PNG structure:
  // Bytes 0-7: PNG signature
  // Bytes 8-11: IHDR chunk size (always 13 for IHDR)
  // Bytes 12-15: "IHDR" string
  // Bytes 16-19: Width (big-endian 32-bit)
  // Bytes 20-23: Height (big-endian 32-bit)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  // Validate dimensions are reasonable
  if (width === 0 || height === 0 || width > 100000 || height > 100000) {
    throw new Error("Invalid PNG dimensions");
  }

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

    // Validate dimensions
    if (w === 0 || h === 0 || w > 100000 || h > 100000) {
      throw new Error("Invalid WebP dimensions");
    }

    return { width: w + 1, height: h + 1 };
  }

  // Check for VP8L (lossless) chunk
  if (buffer.toString("ascii", 12, 16) === "VP8L") {
    // VP8L bitstream: dimensions are in the first 4 bytes after VP8L header
    // 14 bits for width, 14 bits for height
    const b1 = buffer[20];
    const b2 = buffer[21];
    const b3 = buffer[22];
    const b4 = buffer[23];

    const w = ((b2 & 0x3f) << 8) | b1;
    const h = ((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6);

    // Validate dimensions
    if (w === 0 || h === 0 || w > 100000 || h > 100000) {
      throw new Error("Invalid WebP dimensions");
    }

    return { width: w + 1, height: h + 1 };
  }

  // Check for VP8X (extended) chunk
  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    // VP8X has dimensions at offset 24-29
    if (buffer.length < 30) {
      throw new Error("WebP file too small");
    }

    const w = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) & 0x3fffff;
    const h = (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) & 0x3fffff;

    // Validate dimensions
    if (w === 0 || h === 0 || w > 100000 || h > 100000) {
      throw new Error("Invalid WebP dimensions");
    }

    return { width: w + 1, height: h + 1 };
  }

  throw new Error("Unknown WebP format");
}

/**
 * Calculates compression quality based on image resolution
 * Higher resolution images get lower quality to save bandwidth
 */
export function calculateCompressionQuality(width: number, height: number): number {
  const megapixels = (width * height) / 1000000;

  if (megapixels > 20) {
    return 65; // 4K and above
  } else if (megapixels > 12) {
    return 72; // 2K range
  } else if (megapixels > 6) {
    return 78; // 1080p and above
  } else {
    return 85; // Lower resolution
  }
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
