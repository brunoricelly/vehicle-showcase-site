import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleImages,
  addVehicleImage,
  deleteVehicleImage,
  setMainImage,
  getVehicleHistory,
  addVehicleHistory,
  addWebhookLog,
  getWebhookLogs,
  getStoreSettings,
  updateStoreSettings,
  createStoreSettings,
  getStoreContacts,
  createStoreContact,
  updateStoreContact,
  deleteStoreContact,
} from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// Utility to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ VEHICLES ROUTER ============
  vehicles: router({
    // Public: Get all vehicles with filters
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          brand: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getVehicles({
          category: input.category,
          brand: input.brand,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          search: input.search,
          isActive: true,
        });
      }),

    // Public: Get single vehicle by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const vehicle = await getVehicleById(input.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }
        return vehicle;
      }),

    // Admin: Create vehicle
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          brand: z.string().min(1),
          model: z.string().min(1),
          year: z.number().int().min(1900).max(2100),
          category: z.string().min(1),
          price: z.string().regex(/^\d+(\.\d{2})?$/),
          mileage: z.number().optional(),
          color: z.string().optional(),
          transmission: z.string().optional(),
          fuelType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createVehicle({
          ...input,
          createdBy: ctx.user.id,
        });

        // Log to history
        await addVehicleHistory({
          vehicleId: result.insertId as number,
          action: "created",
          changedBy: ctx.user.id,
          changedByName: ctx.user.name || undefined,
          changedByEmail: ctx.user.email || undefined,
          description: `Vehicle created: ${input.title}`,
        });

        return { id: result.insertId, ...input };
      }),

    // Admin: Update vehicle
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          brand: z.string().optional(),
          model: z.string().optional(),
          year: z.number().optional(),
          category: z.string().optional(),
          price: z.string().optional(),
          mileage: z.number().optional(),
          color: z.string().optional(),
          transmission: z.string().optional(),
          fuelType: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const vehicle = await getVehicleById(input.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }

        const changes: Record<string, any> = {};
        const updateData: Record<string, any> = {};

        // Track changes
        if (input.title !== undefined && input.title !== vehicle.title) {
          changes.title = { from: vehicle.title, to: input.title };
          updateData.title = input.title;
        }
        if (input.description !== undefined && input.description !== vehicle.description) {
          changes.description = { from: vehicle.description, to: input.description };
          updateData.description = input.description;
        }
        if (input.brand !== undefined && input.brand !== vehicle.brand) {
          changes.brand = { from: vehicle.brand, to: input.brand };
          updateData.brand = input.brand;
        }
        if (input.model !== undefined && input.model !== vehicle.model) {
          changes.model = { from: vehicle.model, to: input.model };
          updateData.model = input.model;
        }
        if (input.year !== undefined && input.year !== vehicle.year) {
          changes.year = { from: vehicle.year, to: input.year };
          updateData.year = input.year;
        }
        if (input.category !== undefined && input.category !== vehicle.category) {
          changes.category = { from: vehicle.category, to: input.category };
          updateData.category = input.category;
        }
        if (input.price !== undefined && input.price !== vehicle.price.toString()) {
          changes.price = { from: vehicle.price, to: input.price };
          updateData.price = input.price;
        }
        if (input.mileage !== undefined && input.mileage !== vehicle.mileage) {
          changes.mileage = { from: vehicle.mileage, to: input.mileage };
          updateData.mileage = input.mileage;
        }
        if (input.color !== undefined && input.color !== vehicle.color) {
          changes.color = { from: vehicle.color, to: input.color };
          updateData.color = input.color;
        }
        if (input.transmission !== undefined && input.transmission !== vehicle.transmission) {
          changes.transmission = { from: vehicle.transmission, to: input.transmission };
          updateData.transmission = input.transmission;
        }
        if (input.fuelType !== undefined && input.fuelType !== vehicle.fuelType) {
          changes.fuelType = { from: vehicle.fuelType, to: input.fuelType };
          updateData.fuelType = input.fuelType;
        }
        if (input.isActive !== undefined && input.isActive !== vehicle.isActive) {
          changes.isActive = { from: vehicle.isActive, to: input.isActive };
          updateData.isActive = input.isActive;
        }

        if (Object.keys(updateData).length > 0) {
          await updateVehicle(input.id, updateData);

          // Log to history
          await addVehicleHistory({
            vehicleId: input.id,
            action: "updated",
            changedBy: ctx.user.id,
            changedByName: ctx.user.name || undefined,
            changedByEmail: ctx.user.email || undefined,
            changes,
            description: `Vehicle updated: ${vehicle.title}`,
          });
        }

        return { success: true };
      }),

    // Admin: Delete vehicle
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const vehicle = await getVehicleById(input.id);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }

        await deleteVehicle(input.id);

        // Log to history
        await addVehicleHistory({
          vehicleId: input.id,
          action: "deleted",
          changedBy: ctx.user.id,
          changedByName: ctx.user.name || undefined,
          changedByEmail: ctx.user.email || undefined,
          description: `Vehicle deleted: ${vehicle.title}`,
        });

        return { success: true };
      }),
  }),

  // ============ VEHICLE IMAGES ROUTER ============
  vehicleImages: router({
    // Public: Get images for a vehicle
    getByVehicleId: publicProcedure
      .input(z.object({ vehicleId: z.number() }))
      .query(async ({ input }) => {
        return await getVehicleImages(input.vehicleId);
      }),

    // Admin: Upload image
    upload: adminProcedure
      .input(
        z.object({
          vehicleId: z.number(),
          imageData: z.string(), // base64 encoded image
          fileName: z.string(),
          isMainImage: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const vehicle = await getVehicleById(input.vehicleId);
        if (!vehicle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vehicle not found" });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(input.imageData, "base64");

        // Generate unique key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `vehicles/${input.vehicleId}/${timestamp}-${randomSuffix}-${input.fileName}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        // Get current images
        const currentImages = await getVehicleImages(input.vehicleId);

        // Add to database
        const result = await addVehicleImage({
          vehicleId: input.vehicleId,
          imageUrl: url,
          imageKey: fileKey,
          displayOrder: currentImages.length,
          isMainImage: input.isMainImage || currentImages.length === 0,
        });

        return {
          id: result.insertId,
          imageUrl: url,
          imageKey: fileKey,
        };
      }),

    // Admin: Delete image
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteVehicleImage(input.id);
        return { success: true };
      }),

    // Admin: Set main image
    setMainImage: adminProcedure
      .input(z.object({ vehicleId: z.number(), imageId: z.number() }))
      .mutation(async ({ input }) => {
        await setMainImage(input.vehicleId, input.imageId);
        return { success: true };
      }),
  }),

  // ============ VEHICLE HISTORY ROUTER ============
  vehicleHistory: router({
    // Admin: Get history for a vehicle
    getByVehicleId: adminProcedure
      .input(z.object({ vehicleId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getVehicleHistory(input.vehicleId, input.limit);
      }),

    // Admin: Get all webhook logs
    getWebhookLogs: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getWebhookLogs(input.limit);
      }),
  }),

  // ============ WEBHOOKS ROUTER (for n8n integration) ============
  webhooks: router({
    // Webhook: Create vehicle via n8n
    createVehicle: publicProcedure
      .input(
        z.object({
          apiKey: z.string(),
          title: z.string(),
          brand: z.string(),
          model: z.string(),
          year: z.number(),
          category: z.string(),
          price: z.string(),
          description: z.string().optional(),
          mileage: z.number().optional(),
          color: z.string().optional(),
          transmission: z.string().optional(),
          fuelType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Validate API key
        const validApiKey = process.env.WEBHOOK_API_KEY;
        if (!validApiKey || input.apiKey !== validApiKey) {
          await addWebhookLog({
            action: "create",
            status: "failed",
            requestData: input,
            errorMessage: "Invalid API key",
          });

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid API key",
          });
        }

        try {
          // Create vehicle with system user (id: 1 - owner)
          const result = await createVehicle({
            title: input.title,
            brand: input.brand,
            model: input.model,
            year: input.year,
            category: input.category,
            price: input.price,
            description: input.description,
            mileage: input.mileage,
            color: input.color,
            transmission: input.transmission,
            fuelType: input.fuelType,
            createdBy: 1, // System user
          });

          const vehicleId = result.insertId as number;

          // Log history
          await addVehicleHistory({
            vehicleId,
            action: "created",
            changedBy: 1,
            changedByName: "System (n8n)",
            description: `Vehicle created via webhook: ${input.title}`,
          });

          // Log webhook
          await addWebhookLog({
            action: "create",
            status: "success",
            requestData: input,
            responseData: { vehicleId },
            vehicleId,
          });

          return {
            success: true,
            vehicleId,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";

          await addWebhookLog({
            action: "create",
            status: "failed",
            requestData: input,
            errorMessage,
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),

    // Webhook: Delete vehicle via n8n
    deleteVehicle: publicProcedure
      .input(
        z.object({
          apiKey: z.string(),
          vehicleId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        // Validate API key
        const validApiKey = process.env.WEBHOOK_API_KEY;
        if (!validApiKey || input.apiKey !== validApiKey) {
          await addWebhookLog({
            action: "delete",
            status: "failed",
            requestData: input,
            errorMessage: "Invalid API key",
          });

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid API key",
          });
        }

        const vehicle = await getVehicleById(input.vehicleId);
        if (!vehicle) {
          await addWebhookLog({
            action: "delete",
            status: "failed",
            requestData: input,
            errorMessage: "Vehicle not found",
            vehicleId: input.vehicleId,
          });

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vehicle not found",
          });
        }

        try {

          await deleteVehicle(input.vehicleId);

          // Log history
          await addVehicleHistory({
            vehicleId: input.vehicleId,
            action: "deleted",
            changedBy: 1,
            changedByName: "System (n8n)",
            description: `Vehicle deleted via webhook: ${vehicle.title}`,
          });

          // Log webhook
          await addWebhookLog({
            action: "delete",
            status: "success",
            requestData: input,
            responseData: { vehicleId: input.vehicleId },
            vehicleId: input.vehicleId,
          });

          return {
            success: true,
            vehicleId: input.vehicleId,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";

          await addWebhookLog({
            action: "delete",
            status: "failed",
            requestData: input,
            errorMessage,
            vehicleId: input.vehicleId,
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),
  }),

  // ============ STORE SETTINGS & CONTACTS ROUTER ============
  store: router({
    // Public: Get store settings
    settings: publicProcedure.query(async () => {
      return await getStoreSettings();
    }),

    // Public: Get store contacts
    contacts: publicProcedure.query(async () => {
      return await getStoreContacts();
    }),

    // Admin: Update store settings
    updateSettings: adminProcedure
      .input(
        z.object({
          storeName: z.string().optional(),
          storeDescription: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          website: z.string().optional(),
          businessHours: z.string().optional(),
          logoUrl: z.string().optional(),
          bannerUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          await updateStoreSettings({
            ...input,
            updatedBy: ctx.user.id,
          });
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update store settings";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),

    // Admin: Create store contact
    createContact: adminProcedure
      .input(
        z.object({
          type: z.enum(["whatsapp", "instagram", "facebook", "youtube", "email"]),
          value: z.string(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await createStoreContact({
            type: input.type,
            value: input.value,
            displayOrder: input.displayOrder || 0,
            isActive: true,
          });
          return { success: true, id: (result as any).insertId };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create contact";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),

    // Admin: Update store contact
    updateContact: adminProcedure
      .input(
        z.object({
          id: z.number(),
          type: z.enum(["whatsapp", "instagram", "facebook", "youtube", "email"]).optional(),
          value: z.string().optional(),
          isActive: z.boolean().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          await updateStoreContact(id, data);
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update contact";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),

    // Admin: Delete store contact
    deleteContact: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteStoreContact(input.id);
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete contact";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
