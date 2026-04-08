import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for testing
const mockAdminUser = {
  id: 1,
  openId: "admin-test-user",
  email: "admin@test.com",
  name: "Admin Test",
  loginMethod: "test",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user?: typeof mockAdminUser): TrpcContext {
  return {
    user: user || mockAdminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Webhooks Router - API Key Validation", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should reject webhook request with invalid API key", async () => {
    try {
      await caller.webhooks.createVehicle({
        apiKey: "invalid-key-12345",
        title: "Test Vehicle",
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
        category: "sedan",
        price: "25000.00",
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toContain("Invalid API key");
    }
  });

  it("should validate webhook API key is configured in environment", async () => {
    const apiKey = process.env.WEBHOOK_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(0);
    expect(typeof apiKey).toBe("string");
  });

  it("should reject delete webhook with invalid API key", async () => {
    try {
      await caller.webhooks.deleteVehicle({
        apiKey: "wrong-key",
        vehicleId: 1,
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("Vehicles Router - Authorization", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should list public vehicles without authentication", async () => {
    const vehicles = await caller.vehicles.list({});
    expect(Array.isArray(vehicles)).toBe(true);
  });

  it("should filter vehicles by category", async () => {
    const vehicles = await caller.vehicles.list({
      category: "sedan",
    });
    expect(Array.isArray(vehicles)).toBe(true);
  });

  it("should reject vehicle creation without admin role", async () => {
    const publicContext = createMockContext({
      ...mockAdminUser,
      role: "user",
    });
    const publicCaller = appRouter.createCaller(publicContext);

    try {
      await publicCaller.vehicles.create({
        title: "Test",
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
        category: "sedan",
        price: "25000.00",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("Admin access required");
    }
  });

  it("should reject vehicle update without admin role", async () => {
    const publicContext = createMockContext({
      ...mockAdminUser,
      role: "user",
    });
    const publicCaller = appRouter.createCaller(publicContext);

    try {
      await publicCaller.vehicles.update({
        id: 1,
        title: "Updated Title",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should reject vehicle deletion without admin role", async () => {
    const publicContext = createMockContext({
      ...mockAdminUser,
      role: "user",
    });
    const publicCaller = appRouter.createCaller(publicContext);

    try {
      await publicCaller.vehicles.delete({ id: 1 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});

describe("Vehicle History Router - Authorization", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should reject history access without admin role", async () => {
    const publicContext = createMockContext({
      ...mockAdminUser,
      role: "user",
    });
    const publicCaller = appRouter.createCaller(publicContext);

    try {
      await publicCaller.vehicleHistory.getByVehicleId({
        vehicleId: 1,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should reject webhook logs access without admin role", async () => {
    const publicContext = createMockContext({
      ...mockAdminUser,
      role: "user",
    });
    const publicCaller = appRouter.createCaller(publicContext);

    try {
      await publicCaller.vehicleHistory.getWebhookLogs({});
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
