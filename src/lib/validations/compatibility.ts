import { z } from 'zod'
import {
  REPORT_OUTCOMES,
  REPORT_REASONS,
} from '@/features/compatibility/types'

export const createCompatibilityReportSchema = z.object({
  location_id: z.string().uuid('สถานีไม่ถูกต้อง'),
  vehicle_model_id: z.string().uuid('รุ่นมอเตอร์ไซค์ไม่ถูกต้อง'),
  connector_id: z.string().uuid().optional().or(z.literal('')),
  outcome: z.enum(REPORT_OUTCOMES, {
    message: 'กรุณาระบุผลการชาร์จ',
  }),
  reason: z.enum(REPORT_REASONS).optional(),
  charging_speed_kw: z.number().positive('ความเร็วชาร์จต้องมากกว่า 0').optional(),
  charge_duration_min: z
    .number()
    .int()
    .positive('ระยะเวลาชาร์จต้องมากกว่า 0')
    .optional(),
  battery_before_pct: z
    .number()
    .int()
    .min(0, 'แบตเตอรี่ต้องอยู่ระหว่าง 0-100')
    .max(100, 'แบตเตอรี่ต้องอยู่ระหว่าง 0-100')
    .optional(),
  battery_after_pct: z
    .number()
    .int()
    .min(0, 'แบตเตอรี่ต้องอยู่ระหว่าง 0-100')
    .max(100, 'แบตเตอรี่ต้องอยู่ระหว่าง 0-100')
    .optional(),
  adapter_used: z.boolean().default(false),
  notes: z
    .string()
    .max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .or(z.literal('')),
})

export type CreateCompatibilityReportInput = z.infer<
  typeof createCompatibilityReportSchema
>
