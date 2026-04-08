/**
 * Client-side image validation utilities
 * Provides quick validation before sending to server
 */

export interface ImageValidationConfig {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxFileSizeBytes?: number;
  allowedFormats?: string[];
}

export interface ClientImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  format?: string;
  mimeType?: string;
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
 * Validates image file size and format
 */
export function validateImageFile(
  file: File,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): ClientImageValidationResult {
  // Validate file size
  if (config.maxFileSizeBytes && file.size > config.maxFileSizeBytes) {
    const maxSizeMB = (config.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
    const actualSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB, Atual: ${actualSizeMB}MB`,
      fileSizeBytes: file.size,
      mimeType: file.type,
    };
  }

  // Validate format
  if (config.allowedFormats && !config.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Formato não suportado. Formatos aceitos: JPEG, PNG, WebP`,
      fileSizeBytes: file.size,
      mimeType: file.type,
    };
  }

  return {
    valid: true,
    fileSizeBytes: file.size,
    mimeType: file.type,
  };
}

/**
 * Validates image dimensions by reading the image
 */
export function validateImageDimensions(
  imageUrl: string,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): Promise<ClientImageValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (config.minWidth && width < config.minWidth) {
        resolve({
          valid: false,
          error: `Largura mínima: ${config.minWidth}px, Atual: ${width}px`,
          width,
          height,
        });
        return;
      }

      if (config.minHeight && height < config.minHeight) {
        resolve({
          valid: false,
          error: `Altura mínima: ${config.minHeight}px, Atual: ${height}px`,
          width,
          height,
        });
        return;
      }

      if (config.maxWidth && width > config.maxWidth) {
        resolve({
          valid: false,
          error: `Largura máxima: ${config.maxWidth}px, Atual: ${width}px`,
          width,
          height,
        });
        return;
      }

      if (config.maxHeight && height > config.maxHeight) {
        resolve({
          valid: false,
          error: `Altura máxima: ${config.maxHeight}px, Atual: ${height}px`,
          width,
          height,
        });
        return;
      }

      resolve({
        valid: true,
        width,
        height,
      });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        error: "Não foi possível carregar a imagem. Arquivo pode estar corrompido.",
      });
    };

    // Set crossOrigin to handle CORS issues with data URLs
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
  });
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validates multiple images and returns results
 */
export async function validateMultipleImages(
  files: File[],
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
): Promise<ClientImageValidationResult[]> {
  const results: ClientImageValidationResult[] = [];

  for (const file of files) {
    // First validate file basics
    const fileValidation = validateImageFile(file, config);
    if (!fileValidation.valid) {
      results.push(fileValidation);
      continue;
    }

    // Then validate dimensions
    const reader = new FileReader();
    const dimensionValidation = await new Promise<ClientImageValidationResult>(
      (resolve) => {
        reader.onload = async (event) => {
          if (event.target?.result) {
            const dataUrl = event.target.result as string;
            const result = await validateImageDimensions(dataUrl, config);
            resolve({
              ...result,
              fileSizeBytes: file.size,
              mimeType: file.type,
            });
          }
        };
        reader.onerror = () => {
          resolve({
            valid: false,
            error: "Erro ao ler arquivo",
            fileSizeBytes: file.size,
            mimeType: file.type,
          });
        };
        reader.readAsDataURL(file);
      }
    );

    results.push(dimensionValidation);
  }

  return results;
}
