import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
  json,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const actionEnum = pgEnum("action", ["created", "updated", "deleted"]);
export const statusEnum = pgEnum("status", ["success", "failed", "pending"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vehicles table - stores vehicle information
 */
export const vehicles = pgTable("vehicles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // e.g., "sedan", "suv", "sports", "truck"
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  mileage: integer("mileage"), // in kilometers
  color: varchar("color", { length: 50 }),
  transmission: varchar("transmission", { length: 50 }), // "manual", "automatic"
  fuelType: varchar("fuelType", { length: 50 }), // "gasoline", "diesel", "electric", "hybrid"
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: integer("createdBy").notNull(), // user id
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Vehicle images table - stores image metadata and S3 references
 */
export const vehicleImages = pgTable("vehicle_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer("vehicleId").notNull(), // references vehicles.id
  imageUrl: text("imageUrl").notNull(), // S3 CDN URL
  imageKey: varchar("imageKey", { length: 255 }).notNull(), // S3 key for reference
  displayOrder: integer("displayOrder").default(0).notNull(),
  isMainImage: boolean("isMainImage").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VehicleImage = typeof vehicleImages.$inferSelect;
export type InsertVehicleImage = typeof vehicleImages.$inferInsert;

/**
 * Vehicle history table - tracks all changes to vehicles
 */
export const vehicleHistory = pgTable("vehicle_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer("vehicleId").notNull(), // references vehicles.id
  action: actionEnum("action").notNull(),
  changedBy: integer("changedBy").notNull(), // user id
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
export const webhookLogs = pgTable("webhook_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  action: varchar("action", { length: 50 }).notNull(), // "create", "delete"
  status: statusEnum("status").notNull(),
  requestData: json("requestData"), // Full request payload
  responseData: json("responseData"), // Response or error details
  vehicleId: integer("vehicleId"), // references vehicles.id if applicable
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

/**
 * Store settings table - stores global configuration for the shop
 */
export const storeSettings = pgTable("store_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
  saturdayHours: text("saturdayHours"),
  sundayHours: text("sundayHours"),
  whatsappNumber: varchar("whatsappNumber", { length: 20 }),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  updatedBy: integer("updatedBy"), // user id
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;

/**
 * Store contacts table - stores social media and contact information
 */
export const storeContacts = pgTable("store_contacts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: varchar("type", { length: 50 }).notNull(), // "whatsapp", "instagram", "facebook", "youtube", "email"
  value: varchar("value", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StoreContact = typeof storeContacts.$inferSelect;
export type InsertStoreContact = typeof storeContacts.$inferInsert;

/**
 * Authorized admins table - stores emails authorized to access admin panel
 */
export const authorizedAdmins = pgTable("authorized_admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  authorizedBy: integer("authorizedBy"), // user id who authorized this email
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AuthorizedAdmin = typeof authorizedAdmins.$inferSelect;
export type InsertAuthorizedAdmin = typeof authorizedAdmins.$inferInsert;
