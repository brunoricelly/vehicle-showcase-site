import { eq, desc, and, gte, lte, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  vehicles,
  vehicleImages,
  vehicleHistory,
  webhookLogs,
  storeSettings,
  storeContacts,
  authorizedAdmins,
  type Vehicle,
  type VehicleImage,
  type VehicleHistory,
  type WebhookLog,
  type InsertStoreSettings,
  type InsertStoreContact,
  type AuthorizedAdmin,
  type InsertAuthorizedAdmin,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
      console.log("[Database] Connected to PostgreSQL successfully");
    } catch (error) {
      console.warn("[Database] Failed to connect to PostgreSQL:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ VEHICLE QUERIES ============

export async function getVehicles(filters?: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.isActive !== undefined) {
    conditions.push(eq(vehicles.isActive, filters.isActive));
  }

  if (filters?.category) {
    conditions.push(eq(vehicles.category, filters.category));
  }

  if (filters?.brand) {
    conditions.push(eq(vehicles.brand, filters.brand));
  }

  if (filters?.minPrice !== undefined) {
    conditions.push(gte(vehicles.price, filters.minPrice.toString()));
  }

  if (filters?.maxPrice !== undefined) {
    conditions.push(lte(vehicles.price, filters.maxPrice.toString()));
  }

  if (filters?.search) {
    conditions.push(
      sql`(${vehicles.title} LIKE ${`%${filters.search}%`} OR ${vehicles.brand} LIKE ${`%${filters.search}%`} OR ${vehicles.model} LIKE ${`%${filters.search}%`})`
    );
  }

  const query = db.select().from(vehicles);

  let result;
  if (conditions.length > 0) {
    result = await query.where(and(...conditions)).orderBy(desc(vehicles.createdAt));
  } else {
    result = await query.orderBy(desc(vehicles.createdAt));
  }

  // Fetch images for each vehicle
  const vehiclesWithImages = await Promise.all(
    result.map(async (vehicle) => {
      const images = await db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, vehicle.id));
      return {
        ...vehicle,
        images,
      };
    })
  );

  return vehiclesWithImages;
}

export async function getVehicleById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (result.length === 0) return null;

  const vehicle = result[0];
  const images = await db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, vehicle.id));

  return {
    ...vehicle,
    images,
  };
}

export async function createVehicle(data: {
  title: string;
  description?: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  price: string;
  mileage?: number;
  color?: string;
  transmission?: string;
  fuelType?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vehicles).values({
    title: data.title,
    description: data.description,
    brand: data.brand,
    model: data.model,
    year: data.year,
    category: data.category,
    price: data.price as any,
    mileage: data.mileage,
    color: data.color,
    transmission: data.transmission,
    fuelType: data.fuelType,
    createdBy: data.createdBy,
  });

  // Drizzle returns array with ResultSetHeader at [0] containing insertId
  const insertId = (result as any)[0]?.insertId || 0;
  return { id: insertId, insertId }
}

export async function updateVehicle(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    brand: string;
    model: string;
    year: number;
    category: string;
    price: string;
    mileage: number;
    color: string;
    transmission: string;
    fuelType: string;
    isActive: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(vehicles).set(data as any).where(eq(vehicles.id, id));
}

export async function deleteVehicle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete by setting isActive to false
  await db.update(vehicles).set({ isActive: false }).where(eq(vehicles.id, id));
}

// ============ VEHICLE IMAGE QUERIES ============

export async function getVehicleImages(vehicleId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId))
    .orderBy(vehicleImages.displayOrder);
}

export async function addVehicleImage(data: {
  vehicleId: number;
  imageUrl: string;
  imageKey: string;
  displayOrder?: number;
  isMainImage?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vehicleImages).values({
    vehicleId: data.vehicleId,
    imageUrl: data.imageUrl,
    imageKey: data.imageKey,
    displayOrder: data.displayOrder || 0,
    isMainImage: data.isMainImage || false,
  });

  // Drizzle returns array with ResultSetHeader at [0] containing insertId
  const insertId = (result as any)[0]?.insertId || 0;
  return { id: insertId, insertId }
}

export async function deleteVehicleImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(vehicleImages).where(eq(vehicleImages.id, id));
}

export async function setMainImage(vehicleId: number, imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Remove main image flag from all images of this vehicle
  await db
    .update(vehicleImages)
    .set({ isMainImage: false })
    .where(eq(vehicleImages.vehicleId, vehicleId));

  // Set the new main image
  await db
    .update(vehicleImages)
    .set({ isMainImage: true })
    .where(eq(vehicleImages.id, imageId));
}

// ============ VEHICLE HISTORY QUERIES ============

export async function getVehicleHistory(vehicleId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vehicleHistory)
    .where(eq(vehicleHistory.vehicleId, vehicleId))
    .orderBy(desc(vehicleHistory.createdAt))
    .limit(limit);
}

export async function addVehicleHistory(data: {
  vehicleId: number;
  action: "created" | "updated" | "deleted";
  changedBy: number;
  changedByName?: string;
  changedByEmail?: string;
  changes?: Record<string, any>;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertData: any = {
    vehicleId: data.vehicleId,
    action: data.action,
    changedBy: data.changedBy,
  };

  if (data.changedByName !== undefined) insertData.changedByName = data.changedByName;
  if (data.changedByEmail !== undefined) insertData.changedByEmail = data.changedByEmail;
  if (data.changes !== undefined) insertData.changes = data.changes; // Drizzle handles JSON serialization
  if (data.description !== undefined) insertData.description = data.description;

  // Remove id field defensively to ensure Drizzle doesn't try to insert it
  const { id: _id, ...safeData } = insertData;

  const result = await db.insert(vehicleHistory).values(safeData);

  // Drizzle returns array with ResultSetHeader at [0] containing insertId
  const insertId = (result as any)[0]?.insertId || 0;
  return { id: insertId, insertId }
}

// ============ WEBHOOK LOG QUERIES ============

export async function addWebhookLog(data: {
  action: string;
  status: "success" | "failed" | "pending";
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  vehicleId?: number;
  errorMessage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertData: any = {
    action: data.action,
    status: data.status,
    vehicleId: data.vehicleId,
    errorMessage: data.errorMessage,
  };

  if (data.requestData !== undefined) insertData.requestData = data.requestData;
  if (data.responseData !== undefined) insertData.responseData = data.responseData;

  const { id: _id, ...safeData } = insertData;

  const result = await db.insert(webhookLogs).values(safeData);

  // Drizzle returns array with ResultSetHeader at [0] containing insertId
  const insertId = (result as any)[0]?.insertId || 0;
  return { id: insertId, insertId }
}

export async function getWebhookLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(webhookLogs)
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
}

// ============ STORE SETTINGS & CONTACTS QUERIES ============

export async function getStoreSettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(storeSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateStoreSettings(data: Partial<InsertStoreSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(storeSettings).set(data as any).execute();
}

export async function createStoreSettings(data: InsertStoreSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(storeSettings).values(data);
  return { insertId: (result as any).insertId };
}

export async function getStoreContacts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(storeContacts)
    .where(eq(storeContacts.isActive, true))
    .orderBy(storeContacts.displayOrder)
    .execute();
}

export async function createStoreContact(data: InsertStoreContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(storeContacts).values(data);
  return { insertId: (result as any).insertId };
}

export async function updateStoreContact(id: number, data: Partial<InsertStoreContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(storeContacts).set(data as any).where(eq(storeContacts.id, id)).execute();
}

export async function deleteStoreContact(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(storeContacts).where(eq(storeContacts.id, id)).execute();
}

// ============ AUTHORIZED ADMINS QUERIES ============

export async function getAuthorizedAdmins() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(authorizedAdmins)
    .where(eq(authorizedAdmins.isActive, true))
    .orderBy(desc(authorizedAdmins.createdAt))
    .execute();
}

export async function getAuthorizedAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(authorizedAdmins)
    .where(and(eq(authorizedAdmins.email, email), eq(authorizedAdmins.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function addAuthorizedAdmin(data: InsertAuthorizedAdmin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if email already exists
  const existing = await getAuthorizedAdminByEmail(data.email);
  if (existing) {
    throw new Error(`Email ${data.email} já está autorizado`);
  }
  
  const result = await db.insert(authorizedAdmins).values(data);
  return { insertId: (result as any).insertId };
}

export async function removeAuthorizedAdmin(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(authorizedAdmins)
    .set({ isActive: false })
    .where(eq(authorizedAdmins.email, email))
    .execute();
}

export async function isEmailAuthorized(email: string): Promise<boolean> {
  const admin = await getAuthorizedAdminByEmail(email);
  return admin !== null;
}
