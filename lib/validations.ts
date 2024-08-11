// src/lib/validations.ts
import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100)
})

export const rideSchema = z.object({
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
  scheduledTime: z.string().optional()
})

export const cashPaymentSchema = z.object({
  amount: z.number().positive()
})

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})