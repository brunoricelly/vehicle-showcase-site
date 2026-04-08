import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vehicles table - stores vehicle information
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // e.g., "sedan", "suv", "sports", "truck"
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  mileage: int("mileage"), // in kilometers
  color: varchar("color", { length: 50 }),
  transmission: varchar("transmission", { length: 50 }), // "manual", "automatic"
  fuelType: varchar("fuelType", { length: 50 }), // "gasoline", "diesel", "electric", "hybrid"
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(), // user id
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Vehicle images table - stores image metadata and S3 references
 */
export const vehicleImages = mysqlTable("vehicle_images", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").notNull(), // references vehicles.id
  imageUrl: text("imageUrl").notNull(), // S3 CDN URL
  imageKey: varchar("imageKey", { length: 255 }).notNull(), // S3 key for reference
  displayOrder: int("displayOrder").default(0).notNull(),
  isMainImage: boolean("isMainImage").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VehicleImage = typeof vehicleImages.$inferSelect;
export type InsertVehicleImage = typeof vehicleImages.$inferInsert;

/**
 * Vehicle history table - tracks all changes to vehicles
 */
export const vehicleHistory = mysqlTable("vehicle_history", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").notNull(), // references vehicles.id
  action: mysqlEnum("action", ["created", "updated", "deleted"]).notNull(),
  changedBy: int("changedBy").notNull(), // user id
  changedByName: varchar("changedByName", { length: 255 }),
  changedByEmail: varchar("changedByEmail", { length: 320 }),
  changes: json("changes"), // JSON object with before/after values
  description: text("description"), // Human-readable description of changes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VehicleHistory = typeof vehicleHistory.$inferSelect;
export type InsertVehicleHistory = typeof vehicleHistory.$inferInsert;

/**
 * Webhook logs table - tracks all webhook requests for audit and debugging
 */
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 50 }).notNull(), // "create", "delete"
  status: mysqlEnum("status", ["success", "failed", "pending"]).notNull(),
  requestData: json("requestData"), // Full request payload
  responseData: json("responseData"), // Response or error details
  vehicleId: int("vehicleId"), // references vehicles.id if applicable
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

/**
 * Store settings table - stores global configuration for the shop
 */
export const storeSettings = mysqlTable("store_settings", {
  id: int("id").autoincrement().primaryKey(),
  storeName: varchar("storeName", { length: 255 }).notNull(),
  storeDescription: text("storeDescription"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  businessHours: text("businessHours"), // JSON format
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"), // user id
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;

/**
 * Store contacts table - stores social media and contact information
 */
export const storeContacts = mysqlTable("store_contacts", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // "whatsapp", "instagram", "facebook", "youtube", "email"
  value: varchar("value", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreContact = typeof storeContacts.$inferSelect;
export type InsertStoreContact = typeof storeContacts.$inferInsert;
