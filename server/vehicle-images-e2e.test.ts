import { describe, it, expect, beforeAll } from "vitest";
import { createVehicle, getVehicleById, addVehicleImage, getVehicleImages } from "./db";

describe("Vehicle Images E2E - Complete User Flow", () => {
  let vehicleId: number;

  beforeAll(async () => {
    // Step 1: Create a vehicle (simulating admin creating via form)
    const vehicle = await createVehicle({
      title: "E2E Test Vehicle",
      description: "Testing complete image flow",
      brand: "BMW",
      model: "X5",
      year: 2024,
      category: "suv",
      price: "250000",
      mileage: 0,
      color: "Black",
      transmission: "automatic",
      fuelType: "gasoline",
      createdBy: 1,
    });

    vehicleId = vehicle.id;
    console.log(`✅ Step 1: Vehicle created with ID: ${vehicleId}`);
  });

  it("should create vehicle with no images initially", async () => {
    const vehicle = await getVehicleById(vehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.images).toEqual([]);
    console.log(`✅ Vehicle ${vehicleId} has no images initially`);
  });

  it("should add first image (main image)", async () => {
    const imageResult = await addVehicleImage({
      vehicleId,
      imageUrl: "https://cdn.example.com/vehicles/test/main-image.jpg",
      imageKey: "vehicles/test/main-image.jpg",
      displayOrder: 0,
      isMainImage: true,
    });

    expect(imageResult.id).toBeDefined();
    console.log(`✅ First image added with ID: ${imageResult.id}`);
  });

  it("should add second image", async () => {
    const imageResult = await addVehicleImage({
      vehicleId,
      imageUrl: "https://cdn.example.com/vehicles/test/side-view.jpg",
      imageKey: "vehicles/test/side-view.jpg",
      displayOrder: 1,
      isMainImage: false,
    });

    expect(imageResult.id).toBeDefined();
    console.log(`✅ Second image added with ID: ${imageResult.id}`);
  });

  it("should retrieve vehicle with all images", async () => {
    const vehicle = await getVehicleById(vehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.images).toHaveLength(2);

    const images = vehicle?.images || [];
    expect(images[0].imageUrl).toBe("https://cdn.example.com/vehicles/test/main-image.jpg");
    expect(images[0].isMainImage).toBe(true);
    expect(images[1].imageUrl).toBe("https://cdn.example.com/vehicles/test/side-view.jpg");
    expect(images[1].isMainImage).toBe(false);

    console.log(`✅ Vehicle ${vehicleId} retrieved with ${images.length} images`);
    console.log(`   - Image 1 (main): ${images[0].imageUrl}`);
    console.log(`   - Image 2: ${images[1].imageUrl}`);
  });

  it("should retrieve images via getVehicleImages", async () => {
    const images = await getVehicleImages(vehicleId);
    expect(images).toHaveLength(2);
    expect(images[0].displayOrder).toBe(0);
    expect(images[1].displayOrder).toBe(1);

    console.log(`✅ Retrieved ${images.length} images via getVehicleImages`);
  });

  it("should verify images are ready for public display", async () => {
    const vehicle = await getVehicleById(vehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.isActive).toBe(true);

    const images = vehicle?.images || [];
    expect(images.length).toBeGreaterThan(0);

    // Verify each image has required fields for frontend rendering
    images.forEach((img, idx) => {
      expect(img.imageUrl).toBeDefined();
      expect(img.imageUrl).toMatch(/^https?:\/\//);
      expect(img.displayOrder).toBe(idx);
      console.log(`✅ Image ${idx + 1} ready for frontend: ${img.imageUrl}`);
    });
  });

  it("should verify main image is correctly identified", async () => {
    const vehicle = await getVehicleById(vehicleId);
    const images = vehicle?.images || [];
    const mainImage = images.find((img) => img.isMainImage);

    expect(mainImage).toBeDefined();
    expect(mainImage?.imageUrl).toBe("https://cdn.example.com/vehicles/test/main-image.jpg");

    console.log(`✅ Main image correctly identified: ${mainImage?.imageUrl}`);
  });

  it("should verify complete flow: create → add images → retrieve", async () => {
    // This is the complete flow that a user would experience:
    // 1. Admin creates vehicle
    // 2. Admin uploads images
    // 3. Public sees vehicle with images on the site

    const vehicle = await getVehicleById(vehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.brand).toBe("BMW");
    expect(vehicle?.model).toBe("X5");
    expect(vehicle?.images).toHaveLength(2);

    console.log(`✅ Complete E2E flow verified:`);
    console.log(`   - Vehicle: ${vehicle?.brand} ${vehicle?.model}`);
    console.log(`   - Status: Active and ready for public display`);
    console.log(`   - Images: ${vehicle?.images?.length} images available`);
    console.log(`   - Ready for frontend rendering: YES`);
  });
});
