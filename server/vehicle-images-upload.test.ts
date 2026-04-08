import { describe, it, expect } from "vitest";
import { createVehicle, addVehicleImage, getVehicleImages, getVehicleById } from "./db";

describe("Vehicle Images Upload - Integration Tests", () => {
  let testVehicleId: number = 0;
  let testImageId: number = 0;

  it("should create a test vehicle for image upload", async () => {
    const result = await createVehicle({
      title: "Test Vehicle for Images",
      description: "Vehicle for testing image upload",
      brand: "BMW",
      model: "X5",
      year: 2024,
      category: "suv",
      price: "150000.00",
      mileage: 0,
      color: "Black",
      transmission: "automatic",
      fuelType: "gasoline",
      createdBy: 1,
    });

    expect(result.insertId).toBeGreaterThan(0);
    testVehicleId = result.insertId;
    console.log(`✅ Test vehicle created with ID: ${testVehicleId}`);
  });

  it("should add an image to the vehicle", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const result = await addVehicleImage({
      vehicleId: testVehicleId,
      imageUrl: "https://example.com/test-image.jpg",
      imageKey: `vehicles/${testVehicleId}/test-image-${Date.now()}.jpg`,
      displayOrder: 0,
      isMainImage: true,
    });

    expect(result.insertId).toBeGreaterThan(0);
    testImageId = result.insertId;
    console.log(`✅ Image added with ID: ${testImageId}`);
  });

  it("should retrieve the image from database", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const images = await getVehicleImages(testVehicleId);
    expect(images.length).toBeGreaterThan(0);

    const testImage = images.find((img) => img.id === testImageId);
    expect(testImage).toBeDefined();
    expect(testImage?.imageUrl).toBe("https://example.com/test-image.jpg");
    expect(testImage?.isMainImage).toBe(true);
    console.log(`✅ Image retrieved from database: ${testImage?.imageUrl}`);
  });

  it("should add multiple images to the vehicle", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const result2 = await addVehicleImage({
      vehicleId: testVehicleId,
      imageUrl: "https://example.com/test-image-2.jpg",
      imageKey: `vehicles/${testVehicleId}/test-image-2-${Date.now()}.jpg`,
      displayOrder: 1,
      isMainImage: false,
    });

    const result3 = await addVehicleImage({
      vehicleId: testVehicleId,
      imageUrl: "https://example.com/test-image-3.jpg",
      imageKey: `vehicles/${testVehicleId}/test-image-3-${Date.now()}.jpg`,
      displayOrder: 2,
      isMainImage: false,
    });

    expect(result2.insertId).toBeGreaterThan(0);
    expect(result3.insertId).toBeGreaterThan(0);

    const images = await getVehicleImages(testVehicleId);
    expect(images.length).toBe(3);
    console.log(`✅ Multiple images added successfully. Total: ${images.length}`);
  });

  it("should verify vehicle with images appears in vehicle detail", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const vehicle = await getVehicleById(testVehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.images).toBeDefined();
    expect(vehicle?.images.length).toBe(3);
    console.log(`✅ Vehicle detail shows ${vehicle?.images.length} images`);
  });

  it("should verify main image is correctly set", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const images = await getVehicleImages(testVehicleId);
    const mainImage = images.find((img) => img.isMainImage);

    expect(mainImage).toBeDefined();
    expect(mainImage?.id).toBe(testImageId);
    console.log(`✅ Main image correctly identified: ${mainImage?.imageUrl}`);
  });
});
