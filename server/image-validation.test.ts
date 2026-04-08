import { describe, it, expect } from "vitest";
import {
  validateImageDimensions,
  validateImageBasics,
  calculateCompressionQuality,
  formatFileSize,
  DEFAULT_IMAGE_CONFIG,
} from "./imageValidation";

describe("Image Validation - Backend", () => {
  describe("validateImageBasics", () => {
    it("should reject files larger than max size", () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const result = validateImageBasics(largeBuffer, "image/jpeg");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("muito grande");
    });

    it("should reject unsupported formats", () => {
      const buffer = Buffer.from("fake image data");
      const result = validateImageBasics(buffer, "image/bmp");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("não suportado");
    });

    it("should accept valid file size and format", () => {
      const buffer = Buffer.alloc(1024 * 1024); // 1MB
      const result = validateImageBasics(buffer, "image/jpeg");
      expect(result.valid).toBe(true);
      expect(result.fileSizeBytes).toBe(1024 * 1024);
      expect(result.format).toBe("image/jpeg");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should handle fractional sizes", () => {
      expect(formatFileSize(512)).toBe("512 Bytes");
      expect(formatFileSize(1536 * 1024)).toBe("1.5 MB");
    });
  });

  describe("calculateCompressionQuality", () => {
    it("should return lower quality for high megapixel images", () => {
      const highMPQuality = calculateCompressionQuality(4000, 3000); // 12MP
      const lowMPQuality = calculateCompressionQuality(800, 600); // 0.48MP
      expect(highMPQuality).toBeLessThan(lowMPQuality);
    });

    it("should return appropriate quality levels", () => {
      expect(calculateCompressionQuality(4000, 3000)).toBe(0.7); // 12MP
      expect(calculateCompressionQuality(2500, 2000)).toBe(0.8); // 5MP
      expect(calculateCompressionQuality(1600, 1200)).toBe(0.85); // 1.92MP
      expect(calculateCompressionQuality(800, 600)).toBe(0.85); // 0.48MP
    });
  });

  describe("validateImageDimensions - JPEG", () => {
    it("should validate valid JPEG dimensions", () => {
      // Create a minimal valid JPEG header (SOI + SOF0 marker)
      const buffer = Buffer.from([
        0xff, 0xd8, // SOI marker
        0xff, 0xc0, // SOF0 marker
        0x00, 0x11, // Length
        0x08, // Precision
        0x02, 0x58, // Height (600)
        0x03, 0x20, // Width (800)
        0x03, // Components
        0x01, 0x22, 0x00,
        0x02, 0x11, 0x01,
        0x03, 0x11, 0x01,
      ]);

      const result = validateImageDimensions(buffer, "image/jpeg");
      expect(result.valid).toBe(true);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it("should reject JPEG with dimensions too small", () => {
      // Create a JPEG with 200x150 dimensions (below minimum)
      const buffer = Buffer.from([
        0xff, 0xd8, // SOI marker
        0xff, 0xc0, // SOF0 marker
        0x00, 0x11, // Length
        0x08, // Precision
        0x00, 0x96, // Height (150)
        0x00, 0xc8, // Width (200)
        0x03, // Components
        0x01, 0x22, 0x00,
        0x02, 0x11, 0x01,
        0x03, 0x11, 0x01,
      ]);

      const result = validateImageDimensions(buffer, "image/jpeg");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Largura mínima");
    });
  });

  describe("validateImageDimensions - PNG", () => {
    it("should validate valid PNG dimensions", () => {
      // Create a minimal valid PNG header
      // PNG signature + IHDR chunk with 800x600 dimensions
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x03, 0x20, // Width (800)
        0x00, 0x00, 0x02, 0x58, // Height (600)
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
        0x00, 0x00, 0x00, 0x00, // CRC
      ]);

      const result = validateImageDimensions(buffer, "image/png");
      expect(result.valid).toBe(true);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it("should reject PNG with dimensions too large", () => {
      // Create a PNG with 5000x4000 dimensions (above maximum)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x13, 0x88, // Width (5000)
        0x00, 0x00, 0x0f, 0xa0, // Height (4000)
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
        0x00, 0x00, 0x00, 0x00, // CRC
      ]);

      const result = validateImageDimensions(buffer, "image/png");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("máxima");
    });
  });

  describe("Full validation flow", () => {
    it("should validate a complete valid image workflow", () => {
      // Create a valid PNG buffer
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x03, 0x20, // Width (800)
        0x00, 0x00, 0x02, 0x58, // Height (600)
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
        0x00, 0x00, 0x00, 0x00, // CRC
      ]);

      const result = validateImageDimensions(buffer, "image/png");

      expect(result.valid).toBe(true);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.format).toBe("image/png");
      expect(result.fileSizeBytes).toBe(buffer.length);

      console.log(`✅ Image validation passed: ${result.width}x${result.height}px, ${formatFileSize(result.fileSizeBytes || 0)}`);
    });

    it("should provide helpful error messages for invalid images", () => {
      // Test with file too large
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      const result = validateImageBasics(largeBuffer, "image/jpeg");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("5.0MB");
      expect(result.error).toContain("6.0MB");

      console.log(`✅ Error message helpful: "${result.error}"`);
    });
  });

  describe("Configuration customization", () => {
    it("should respect custom validation config", () => {
      const customConfig = {
        minWidth: 1000,
        minHeight: 800,
        maxWidth: 2000,
        maxHeight: 1600,
        maxFileSizeBytes: 2 * 1024 * 1024, // 2MB
        allowedFormats: ["image/jpeg"],
      };

      // Create a PNG (not in allowed formats)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x03, 0x20, // 800 (below minimum)
        0x00, 0x00, 0x02, 0x58,
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);

      const result = validateImageDimensions(buffer, "image/png", customConfig);
      expect(result.valid).toBe(false);
      // PNG format is not in allowedFormats, so it should fail format check first
      expect(result.error).toContain("não suportado");
    });
  });
});
