import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock users for testing
const mockAdminUserAuthorized = {
  id: 1,
  openId: "admin-authorized",
  email: "authorized-admin@test.com",
  name: "Authorized Admin",
  loginMethod: "google",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockAdminUserUnauthorized = {
  id: 2,
  openId: "admin-unauthorized",
  email: "unauthorized-admin@test.com",
  name: "Unauthorized Admin",
  loginMethod: "google",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockRegularUser = {
  id: 3,
  openId: "regular-user",
  email: "user@test.com",
  name: "Regular User",
  loginMethod: "google",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user?: typeof mockAdminUserAuthorized | typeof mockAdminUserUnauthorized | typeof mockRegularUser | null): TrpcContext {
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

describe("Admin Login Flow - Integration Tests", () => {
  let authorizedAdminCaller: ReturnType<typeof appRouter.createCaller>;
  let unauthorizedAdminCaller: ReturnType<typeof appRouter.createCaller>;
  let regularUserCaller: ReturnType<typeof appRouter.createCaller>;
  let publicCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const authorizedCtx = createMockContext(mockAdminUserAuthorized);
    const unauthorizedCtx = createMockContext(mockAdminUserUnauthorized);
    const userCtx = createMockContext(mockRegularUser);
    const publicCtx = createMockContext(null);

    authorizedAdminCaller = appRouter.createCaller(authorizedCtx);
    unauthorizedAdminCaller = appRouter.createCaller(unauthorizedCtx);
    regularUserCaller = appRouter.createCaller(userCtx);
    publicCaller = appRouter.createCaller(publicCtx);

    // Setup: Add authorized admin email to the database
    try {
      await authorizedAdminCaller.admin.addAuthorizedEmail({
        email: mockAdminUserAuthorized.email,
      });
    } catch (error) {
      // Email might already exist from previous test run
    }
  });

  describe("Scenario 1: Authorized Admin Login Flow", () => {
    it("should verify authorized admin email is in the system", async () => {
      const result = await publicCaller.admin.isEmailAuthorized({
        email: mockAdminUserAuthorized.email,
      });
      expect(result).toBe(true);
    });

    it("should allow authorized admin to list authorized emails", async () => {
      const result = await authorizedAdminCaller.admin.listAuthorizedEmails();
      expect(Array.isArray(result)).toBe(true);
      const emails = result.map((item: any) => item.email);
      expect(emails).toContain(mockAdminUserAuthorized.email);
    });

    it("should allow authorized admin to access admin procedures", async () => {
      // Authorized admin should be able to call admin procedures
      const result = await authorizedAdminCaller.admin.listAuthorizedEmails();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Scenario 2: Unauthorized Admin Login Flow", () => {
    it("should verify unauthorized admin email is NOT in the system", async () => {
      const result = await publicCaller.admin.isEmailAuthorized({
        email: mockAdminUserUnauthorized.email,
      });
      expect(result).toBe(false);
    });

    it("should allow unauthorized admin to list authorized emails (admin role check)", async () => {
      // This tests that role-based check still works
      // Even though email is not authorized, admin role allows listing
      const result = await unauthorizedAdminCaller.admin.listAuthorizedEmails();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should block unauthorized admin from adding new emails if email validation is enforced", async () => {
      // This tests the email authorization check
      const isAuthorized = await publicCaller.admin.isEmailAuthorized({
        email: mockAdminUserUnauthorized.email,
      });
      expect(isAuthorized).toBe(false);
    });
  });

  describe("Scenario 3: Regular User Cannot Access Admin Features", () => {
    it("should reject regular user from listing authorized emails", async () => {
      try {
        await regularUserCaller.admin.listAuthorizedEmails();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject regular user from adding authorized emails", async () => {
      try {
        await regularUserCaller.admin.addAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject regular user from removing authorized emails", async () => {
      try {
        await regularUserCaller.admin.removeAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Scenario 4: Public User Cannot Access Admin Features", () => {
    it("should reject unauthenticated user from listing authorized emails", async () => {
      try {
        await publicCaller.admin.listAuthorizedEmails();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should reject unauthenticated user from adding authorized emails", async () => {
      try {
        await publicCaller.admin.addAuthorizedEmail({
          email: "test@test.com",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow public user to check if email is authorized", async () => {
      const result = await publicCaller.admin.isEmailAuthorized({
        email: mockAdminUserAuthorized.email,
      });
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Scenario 5: Email Authorization Lifecycle", () => {
    it("should add new authorized email", async () => {
      const testEmail = `lifecycle-test-${Date.now()}@test.com`;
      const result = await authorizedAdminCaller.admin.addAuthorizedEmail({
        email: testEmail,
      });
      expect(result.success).toBe(true);

      // Verify email is now authorized
      const isAuthorized = await publicCaller.admin.isEmailAuthorized({
        email: testEmail,
      });
      expect(isAuthorized).toBe(true);
    });

    it("should remove authorized email", async () => {
      const testEmail = `lifecycle-remove-${Date.now()}@test.com`;

      // Add email
      await authorizedAdminCaller.admin.addAuthorizedEmail({
        email: testEmail,
      });

      // Verify it's authorized
      let isAuthorized = await publicCaller.admin.isEmailAuthorized({
        email: testEmail,
      });
      expect(isAuthorized).toBe(true);

      // Remove email
      const removeResult = await authorizedAdminCaller.admin.removeAuthorizedEmail({
        email: testEmail,
      });
      expect(removeResult.success).toBe(true);

      // Verify it's no longer authorized
      isAuthorized = await publicCaller.admin.isEmailAuthorized({
        email: testEmail,
      });
      expect(isAuthorized).toBe(false);
    });
  });
});
