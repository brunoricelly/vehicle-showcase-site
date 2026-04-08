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

const mockRegularUser = {
  id: 2,
  openId: "regular-test-user",
  email: "user@test.com",
  name: "Regular User",
  loginMethod: "test",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user?: typeof mockAdminUser | typeof mockRegularUser | null): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Authorized Admins Router", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let userCaller: ReturnType<typeof appRouter.createCaller>;
  let publicCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const adminCtx = createMockContext(mockAdminUser);
    const userCtx = createMockContext(mockRegularUser);
    const publicCtx = createMockContext(null);

    adminCaller = appRouter.createCaller(adminCtx);
    userCaller = appRouter.createCaller(userCtx);
    publicCaller = appRouter.createCaller(publicCtx);
  });

  describe("isEmailAuthorized - Public Query", () => {
    it("should return false for unauthorized email", async () => {
      const result = await publicCaller.admin.isEmailAuthorized({
        email: "unauthorized@test.com",
      });
      expect(result).toBe(false);
    });

    it("should return true for authorized email (after adding)", async () => {
      // First add an email
      const testEmail = `authorized-${Date.now()}@test.com`;
      try {
        await adminCaller.admin.addAuthorizedEmail({
          email: testEmail,
        });

        // Then check if it's authorized
        const result = await publicCaller.admin.isEmailAuthorized({
          email: testEmail,
        });
        expect(result).toBe(true);
      } catch (error) {
        // Email might already exist from previous test run
        const result = await publicCaller.admin.isEmailAuthorized({
          email: testEmail,
        });
        expect(result).toBe(true);
      }
    });
  });

  describe("addAuthorizedEmail - Admin Only", () => {
    it("should reject non-admin users", async () => {
      try {
        await userCaller.admin.addAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated users", async () => {
      try {
        await publicCaller.admin.addAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow admin to add authorized email", async () => {
      const testEmail = `new-admin-${Date.now()}@test.com`;
      const result = await adminCaller.admin.addAuthorizedEmail({
        email: testEmail,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("removeAuthorizedEmail - Admin Only", () => {
    it("should reject non-admin users", async () => {
      try {
        await userCaller.admin.removeAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated users", async () => {
      try {
        await publicCaller.admin.removeAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow admin to remove authorized email", async () => {
      const testEmail = `remove-admin-${Date.now()}@test.com`;
      
      // First add an email
      try {
        await adminCaller.admin.addAuthorizedEmail({
          email: testEmail,
        });
      } catch (error) {
        // Email might already exist
      }

      // Then remove it
      const result = await adminCaller.admin.removeAuthorizedEmail({
        email: testEmail,
      });
      expect(result.success).toBe(true);

      // Verify it's no longer authorized
      const isAuthorized = await publicCaller.admin.isEmailAuthorized({
        email: testEmail,
      });
      expect(isAuthorized).toBe(false);
    });
  });

  describe("listAuthorizedEmails - Admin Only", () => {
    it("should reject non-admin users", async () => {
      try {
        await userCaller.admin.listAuthorizedEmails();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated users", async () => {
      try {
        await publicCaller.admin.listAuthorizedEmails();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow admin to list authorized emails", async () => {
      const result = await adminCaller.admin.listAuthorizedEmails();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("Admin Webhooks Router - Authorized Emails", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("addAuthorizedEmail Webhook", () => {
    it("should reject webhook request with invalid API key", async () => {
      try {
        await caller.adminWebhooks.addAuthorizedEmail({
          apiKey: "invalid-key-12345",
          email: "test@test.com",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should accept webhook request with valid API key", async () => {
      const validApiKey = process.env.WEBHOOK_API_KEY;
      if (!validApiKey) {
        console.warn("WEBHOOK_API_KEY not set, skipping webhook test");
        return;
      }

      const testEmail = `webhook-add-${Date.now()}@test.com`;
      const result = await caller.adminWebhooks.addAuthorizedEmail({
        apiKey: validApiKey,
        email: testEmail,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("removeAuthorizedEmail Webhook", () => {
    it("should reject webhook request with invalid API key", async () => {
      try {
        await caller.adminWebhooks.removeAuthorizedEmail({
          apiKey: "invalid-key-12345",
          email: "test@test.com",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should accept webhook request with valid API key", async () => {
      const validApiKey = process.env.WEBHOOK_API_KEY;
      if (!validApiKey) {
        console.warn("WEBHOOK_API_KEY not set, skipping webhook test");
        return;
      }

      const testEmail = `webhook-remove-${Date.now()}@test.com`;

      // First add an email
      try {
        await caller.adminWebhooks.addAuthorizedEmail({
          apiKey: validApiKey,
          email: testEmail,
        });
      } catch (error) {
        // Email might already exist
      }

      // Then remove it
      const result = await caller.adminWebhooks.removeAuthorizedEmail({
        apiKey: validApiKey,
        email: testEmail,
      });
      expect(result.success).toBe(true);
    });
  });
});
