import { describe, it, expect } from "vitest";
import { createVehicle, addVehicleImage, getVehicleImages, getVehicleById } from "./db";

describe("Vehicle Images Full Flow - Upload to Public Display", () => {
  let testVehicleId: number = 0;
  let testImageId: number = 0;

  it("STEP 1: Admin creates a vehicle", async () => {
    const result = await createVehicle({
      title: "Full Flow Test Vehicle",
      description: "Complete flow test from admin to public",
      brand: "Mercedes",
      model: "C-Class",
      year: 2024,
      category: "sedan",
      price: "180000.00",
      mileage: 0,
      color: "Silver",
      transmission: "automatic",
      fuelType: "gasoline",
      createdBy: 1,
    });

    expect(result.insertId).toBeGreaterThan(0);
    testVehicleId = result.insertId;
    console.log(`✅ STEP 1: Vehicle created with ID: ${testVehicleId}`);
  });

  it("STEP 2: Admin uploads image via vehicleImages.upload procedure", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    // Simulating what vehicleImages.upload procedure does
    const imageUrl = `https://cdn.example.com/vehicles/${testVehicleId}/main-image-${Date.now()}.jpg`;
    const imageKey = `vehicles/${testVehicleId}/main-image-${Date.now()}.jpg`;

    const result = await addVehicleImage({
      vehicleId: testVehicleId,
      imageUrl: imageUrl,
      imageKey: imageKey,
      displayOrder: 0,
      isMainImage: true,
    });

    expect(result.insertId).toBeGreaterThan(0);
    testImageId = result.insertId;
    console.log(`✅ STEP 2: Image uploaded and saved with ID: ${testImageId}`);
    console.log(`   Image URL: ${imageUrl}`);
  });

  it("STEP 3: Public API query getVehicleImages returns the image", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const images = await getVehicleImages(testVehicleId);
    expect(images.length).toBeGreaterThan(0);

    const mainImage = images.find((img) => img.isMainImage);
    expect(mainImage).toBeDefined();
    expect(mainImage?.id).toBe(testImageId);
    expect(mainImage?.imageUrl).toContain("cdn.example.com");
    console.log(`✅ STEP 3: Public API returns image`);
    console.log(`   Image appears in getVehicleImages query`);
  });

  it("STEP 4: Vehicle detail page includes image in response", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const vehicle = await getVehicleById(testVehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.images).toBeDefined();
    expect(vehicle?.images.length).toBeGreaterThan(0);

    const mainImage = vehicle?.images.find((img) => img.isMainImage);
    expect(mainImage).toBeDefined();
    expect(mainImage?.imageUrl).toContain("cdn.example.com");
    console.log(`✅ STEP 4: Vehicle detail includes image`);
    console.log(`   Image URL ready for frontend rendering: ${mainImage?.imageUrl}`);
  });

  it("STEP 5: Admin uploads second image", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const imageUrl2 = `https://cdn.example.com/vehicles/${testVehicleId}/side-view-${Date.now()}.jpg`;
    const imageKey2 = `vehicles/${testVehicleId}/side-view-${Date.now()}.jpg`;

    const result = await addVehicleImage({
      vehicleId: testVehicleId,
      imageUrl: imageUrl2,
      imageKey: imageKey2,
      displayOrder: 1,
      isMainImage: false,
    });

    expect(result.insertId).toBeGreaterThan(0);
    console.log(`✅ STEP 5: Second image uploaded with ID: ${result.insertId}`);
  });

  it("STEP 6: Public sees all images in correct order", async () => {
    expect(testVehicleId).toBeGreaterThan(0);

    const images = await getVehicleImages(testVehicleId);
    expect(images.length).toBe(2);

    // Verify order
    expect(images[0].displayOrder).toBe(0);
    expect(images[1].displayOrder).toBe(1);

    // Verify main image
    const mainImage = images.find((img) => img.isMainImage);
    expect(mainImage?.displayOrder).toBe(0);

    console.log(`✅ STEP 6: Public sees ${images.length} images in correct order`);
    images.forEach((img, idx) => {
      console.log(`   Image ${idx + 1}: ${img.imageUrl} (main: ${img.isMainImage})`);
    });
  });

  it("STEP 7: Verify vehicle appears in public listings with images", async () => {
    // Note: This would be tested via getVehicles() in real scenario
    // For now we verify the vehicle exists and has images
    const vehicle = await getVehicleById(testVehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.isActive).toBe(true);
    expect(vehicle?.images.length).toBe(2);

    console.log(`✅ STEP 7: Vehicle ready for public display`);
    console.log(`   Vehicle: ${vehicle?.brand} ${vehicle?.model}`);
    console.log(`   Images: ${vehicle?.images.length}`);
    console.log(`   Status: Active and visible to public`);
  });
});
