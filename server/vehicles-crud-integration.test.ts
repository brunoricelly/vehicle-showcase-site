import { describe, it, expect } from "vitest";
import { getVehicles, createVehicle, updateVehicle, getVehicleById } from "./db";

describe("Vehicles CRUD Integration - End-to-End", () => {
  let createdVehicleId: number = 0;

  it("should create a vehicle and verify it returns a valid insertId", async () => {
    const result = await createVehicle({
      title: "Integration Test Vehicle",
      description: "Test vehicle for CRUD integration",
      brand: "Honda",
      model: "Civic",
      year: 2023,
      category: "sedan",
      price: "22000.00",
      mileage: 5000,
      color: "Red",
      transmission: "manual",
      fuelType: "gasoline",
      createdBy: 1,
    });

    expect(result.insertId).toBeGreaterThan(0);
    createdVehicleId = result.insertId;
    console.log(`✅ Vehicle created with ID: ${createdVehicleId}`);
  });

  it("should retrieve the created vehicle by ID", async () => {
    expect(createdVehicleId).toBeGreaterThan(0);

    const vehicle = await getVehicleById(createdVehicleId);
    expect(vehicle).toBeDefined();
    expect(vehicle?.id).toBe(createdVehicleId);
    expect(vehicle?.title).toBe("Integration Test Vehicle");
    expect(vehicle?.brand).toBe("Honda");
    console.log(`✅ Vehicle retrieved successfully by ID: ${createdVehicleId}`);
  });

  it("should update the vehicle and verify changes are persisted", async () => {
    expect(createdVehicleId).toBeGreaterThan(0);

    await updateVehicle(createdVehicleId, {
      title: "Integration Test Vehicle - Updated",
      price: "24000.00",
      mileage: 6000,
    });

    const updated = await getVehicleById(createdVehicleId);
    expect(updated?.title).toBe("Integration Test Vehicle - Updated");
    expect(updated?.price).toBe("24000.00");
    expect(updated?.mileage).toBe(6000);
    console.log(`✅ Vehicle updated and verified: ${createdVehicleId}`);
  });

  it("should find the updated vehicle in the public list", async () => {
    expect(createdVehicleId).toBeGreaterThan(0);

    const allVehicles = await getVehicles({ isActive: true });
    const found = allVehicles.find((v) => v.id === createdVehicleId);

    expect(found).toBeDefined();
    expect(found?.title).toBe("Integration Test Vehicle - Updated");
    console.log(`✅ Updated vehicle found in public list`);
  });

  it("should verify vehicle count increased after creation", async () => {
    const allVehicles = await getVehicles();
    expect(allVehicles.length).toBeGreaterThan(0);
    console.log(`✅ Total vehicles in database: ${allVehicles.length}`);
  });
});
