import { z } from 'zod'

export const suggestVehicleSchema = z.object({
  brand: z
    .string()
    .min(1, 'กรุณาระบุยี่ห้อ')
    .max(100, 'ยี่ห้อยาวเกินไป'),
  model: z
    .string()
    .min(1, 'กรุณาระบุรุ่น')
    .max(100, 'ชื่อรุ่นยาวเกินไป'),
})
