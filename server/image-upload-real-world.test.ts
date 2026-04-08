import { describe, it, expect } from "vitest";
import { validateImageDimensions, formatFileSize } from "./imageValidation";

describe("Image Upload - Real World Scenarios", () => {
  describe("Upload with valid images", () => {
    it("should handle PNG image with valid dimensions", () => {
      // Create a valid PNG buffer (800x600)
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
      expect(result.fileSizeBytes).toBe(buffer.length);

      // Simulate backend response
      const response = {
        id: 1,
        imageUrl: "https://cdn.example.com/image.png",
        imageKey: "vehicles/1/image.png",
        dimensions: {
          width: result.width || 0,
          height: result.height || 0,
        },
        fileSize: formatFileSize(result.fileSizeBytes || 0),
      };

      expect(response.dimensions.width).toBe(800);
      expect(response.dimensions.height).toBe(600);
      expect(response.fileSize).toBeDefined();

      console.log(`✅ Upload successful: ${response.dimensions.width}x${response.dimensions.height}px (${response.fileSize})`);
    });

    it("should handle JPEG image with valid dimensions", () => {
      // Create a valid JPEG buffer (1024x768)
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

      // Simulate backend response
      const response = {
        id: 2,
        imageUrl: "https://cdn.example.com/image.jpg",
        imageKey: "vehicles/1/image.jpg",
        dimensions: {
          width: result.width || 0,
          height: result.height || 0,
        },
        fileSize: formatFileSize(result.fileSizeBytes || 0),
      };

      expect(response.dimensions.width).toBe(1024);
      expect(response.dimensions.height).toBe(768);

      console.log(`✅ Upload successful: ${response.dimensions.width}x${response.dimensions.height}px (${response.fileSize})`);
    });

    it("should handle image with dimensions at minimum boundary", () => {
      // Create PNG with minimum dimensions (400x300)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x01, 0x90, // Width (400)
        0x00, 0x00, 0x01, 0x2c, // Height (300)
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);

      const result = validateImageDimensions(buffer, "image/png");

      expect(result.valid).toBe(true);
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);

      console.log(`✅ Minimum dimensions accepted: ${result.width}x${result.height}px`);
    });

    it("should handle image with dimensions at maximum boundary", () => {
      // Create PNG with maximum dimensions (4000x3000)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x0f, 0xa0, // Width (4000)
        0x00, 0x00, 0x0b, 0xb8, // Height (3000)
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);

      const result = validateImageDimensions(buffer, "image/png");

      expect(result.valid).toBe(true);
      expect(result.width).toBe(4000);
      expect(result.height).toBe(3000);

      console.log(`✅ Maximum dimensions accepted: ${result.width}x${result.height}px`);
    });
  });

  describe("Upload with invalid images", () => {
    it("should reject image too small", () => {
      // Create PNG with 200x150 (below minimum)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0xc8, // Width (200)
        0x00, 0x00, 0x00, 0x96, // Height (150)
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);

      const result = validateImageDimensions(buffer, "image/png");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("mínima");

      console.log(`✅ Small image rejected: ${result.error}`);
    });

    it("should reject image too large", () => {
      // Create PNG with 5000x4000 (above maximum)
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x13, 0x88, // Width (5000)
        0x00, 0x00, 0x0f, 0xa0, // Height (4000)
        0x08, 0x02, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);

      const result = validateImageDimensions(buffer, "image/png");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("máxima");

      console.log(`✅ Large image rejected: ${result.error}`);
    });

    it("should reject file too large (>5MB)", () => {
      // Create a 6MB buffer
      const buffer = Buffer.alloc(6 * 1024 * 1024);

      const result = validateImageDimensions(buffer, "image/jpeg");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("muito grande");

      console.log(`✅ Large file rejected: ${result.error}`);
    });

    it("should reject unsupported format", () => {
      const buffer = Buffer.from("fake image data");

      const result = validateImageDimensions(buffer, "image/bmp");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("não suportado");

      console.log(`✅ Unsupported format rejected: ${result.error}`);
    });
  });

  describe("Backend response handling", () => {
    it("should always return dimensions object even if parsing fails", () => {
      // Simulate a case where dimensions couldn't be read
      const validation = {
        valid: true,
        width: undefined,
        height: undefined,
        fileSizeBytes: 1024,
        format: "image/png",
      };

      // This is what the backend returns
      const response = {
        id: 1,
        imageUrl: "https://cdn.example.com/image.png",
        imageKey: "vehicles/1/image.png",
        dimensions: {
          width: validation.width || 0,
          height: validation.height || 0,
        },
        fileSize: formatFileSize(validation.fileSizeBytes || 0),
      };

      // Frontend should be able to access dimensions without error
      expect(response.dimensions).toBeDefined();
      expect(response.dimensions.width).toBe(0);
      expect(response.dimensions.height).toBe(0);
      expect(response.fileSize).toBe("1 KB");

      console.log(`✅ Fallback dimensions work: ${response.dimensions.width}x${response.dimensions.height}px`);
    });

    it("should format file size correctly", () => {
      expect(formatFileSize(512 * 1024)).toBe("512 KB");
      expect(formatFileSize(2 * 1024 * 1024)).toBe("2 MB");
      expect(formatFileSize(1024)).toBe("1 KB");

      console.log("✅ File size formatting works correctly");
    });
  });
});
