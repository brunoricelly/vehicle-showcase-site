import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Store Settings Synchronization", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let publicCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const mockAdminUser = {
      id: 1,
      openId: "test-admin",
      email: "test-admin@test.com",
      name: "Test Admin",
      loginMethod: "google" as const,
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const adminCtx: TrpcContext = {
      user: mockAdminUser,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };

    const publicCtx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };

    adminCaller = appRouter.createCaller(adminCtx);
    publicCaller = appRouter.createCaller(publicCtx);
  });

  it("should update store settings successfully", async () => {
    const result = await adminCaller.store.updateSettings({
      storeName: "Test Store",
      phone: "11999999999",
      email: "test@store.com",
      address: "Rua Teste, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
    });
    expect(result.success).toBe(true);
  });

  it("should retrieve store settings after update", async () => {
    const settings = await publicCaller.store.settings();
    expect(settings).toBeDefined();
  });

  it("should sync phone number across queries", async () => {
    await adminCaller.store.updateSettings({
      phone: "21988888888",
    });

    const settings = await publicCaller.store.settings();
    if (settings) {
      expect(settings.phone).toBe("21988888888");
    }
  });

  it("should sync email across queries", async () => {
    await adminCaller.store.updateSettings({
      email: "newemail@store.com",
    });

    const settings = await publicCaller.store.settings();
    if (settings) {
      expect(settings.email).toBe("newemail@store.com");
    }
  });

  it("should sync address across queries", async () => {
    await adminCaller.store.updateSettings({
      address: "Avenida Paulista, 1000",
      city: "São Paulo",
      state: "SP",
    });

    const settings = await publicCaller.store.settings();
    if (settings) {
      expect(settings.address).toBe("Avenida Paulista, 1000");
      expect(settings.city).toBe("São Paulo");
    }
  });
});
