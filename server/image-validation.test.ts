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
      const largeBuffer = Buffer.alloc(25 * 1024 * 1024); // 25MB (acima do limite de 20MB)
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
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should handle fractional sizes", () => {
      expect(formatFileSize(512)).toBe("512 B");
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
      expect(calculateCompressionQuality(4000, 3000)).toBe(78); // 12MP (6-12MP range)
      expect(calculateCompressionQuality(2500, 2000)).toBe(85); // 5MP (< 6MP)
      expect(calculateCompressionQuality(1600, 1200)).toBe(85); // 1.92MP (< 6MP)
      expect(calculateCompressionQuality(800, 600)).toBe(85); // 0.48MP (< 6MP)
    });
  });

  describe("validateImageDimensions - JPEG", () => {
    it("should validate valid JPEG dimensions", () => {
      // Create a JPEG with 1024x768 dimensions (mínimo válido)
      const buffer = Buffer.from([
        0xff, 0xd8, // SOI marker
        0xff, 0xc0, // SOF0 marker
        0x00, 0x11, // Length
        0x08, // Precision
        0x03, 0x00, // Height (768)
        0x04, 0x00, // Width (1024)
        0x03, // Components
        0x01, 0x22, 0x00,
        0x02, 0x11, 0x01,
        0x03, 0x11, 0x01,
      ]);

      const result = validateImageDimensions(buffer, "image/jpeg");
      expect(result.valid).toBe(true);
      expect(result.width).toBe(1024);
      expect(result.height).toBe(768);
    });

    it("should accept JPEG with any dimensions", () => {
      // Create a JPEG with 512x384 dimensions (agora aceita qualquer tamanho)
      const buffer = Buffer.from([
        0xff, 0xd8, // SOI marker
        0xff, 0xc0, // SOF0 marker
        0x00, 0x11, // Length
        0x08, // Precision
        0x01, 0x80, // Height (384)
        0x02, 0x00, // Width (512)
        0x03, // Components
        0x01, 0x22, 0x00,
        0x02, 0x11, 0x01,
        0x03, 0x11, 0x01,
      ]);

      const result = validateImageDimensions(buffer, "image/jpeg");
      expect(result.valid).toBe(true);
      expect(result.width).toBe(512);
      expect(result.height).toBe(384);
    });
  });

  describe("validateImageDimensions - PNG", () => {
    it("should validate valid PNG dimensions", () => {
      // Create a minimal valid PNG header
      // PNG signature + IHDR chunk with 1024x768 dimensions (mínimo válido)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x04, 0x00, // Width (1024)
        0x00, 0x00, 0x03, 0x00, // Height (768)
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
        0x00, 0x00, 0x00, 0x00, // CRC
      ]);

      const result = validateImageDimensions(buffer, "image/png");
      expect(result.valid).toBe(true);
      expect(result.width).toBe(1024);
      expect(result.height).toBe(768);
    });

        it("should accept images with any minimum dimensions", () => {
      // Create a PNG with 400x300 dimensions (agora aceita qualquer tamanho)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x01, 0x90, // Width (400)
        0x00, 0x00, 0x01, 0x2c, // Height (300)
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
        0x00, 0x00, 0x00, 0x00, // CRC
      ]);

      const result = validateImageDimensions(buffer, "image/png");
      expect(result.valid).toBe(true);
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);
    });;
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

      expect(result.valid).toBe(true); // 800x600 agora é válido (sem mínimo)
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);

      console.log(`✅ Image validation accepted: ${result.width}x${result.height}px`);
    });

    it("should provide helpful error messages for invalid images", () => {
      // Test with file too large
      const largeBuffer = Buffer.alloc(25 * 1024 * 1024);
      const result = validateImageBasics(largeBuffer, "image/jpeg");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("20.0MB");
      expect(result.error).toContain("25.0MB");

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
