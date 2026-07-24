import { z } from 'zod'

export const createStationSchema = z.object({
  name: z.string().min(2, 'ชื่อสถานีต้องมีอย่างน้อย 2 ตัวอักษร').max(200),
  address: z.string().min(5, 'กรุณากรอกที่อยู่'),
  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  postal_code: z.string().optional(),
  description: z.string().optional(),
  operating_hours: z.string().optional(),
  contact_phone: z.string().optional(),
  website_url: z
    .string()
    .url('URL ไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  is_free: z.boolean().default(false),
  price_description: z.string().optional(),
  latitude: z.number().min(-90, 'ละติจูดไม่ถูกต้อง').max(90, 'ละติจูดไม่ถูกต้อง'),
  longitude: z
    .number()
    .min(-180, 'ลองจิจูดไม่ถูกต้อง')
    .max(180, 'ลองจิจูดไม่ถูกต้อง'),
  connector_type_ids: z
    .array(z.string().uuid())
    .min(1, 'กรุณาเลือกหัวชาร์จอย่างน้อย 1 ประเภท'),
  amenity_ids: z.array(z.string().uuid()).optional(),
})

export const createReviewSchema = z.object({
  location_id: z.string().uuid(),
  rating: z
    .number()
    .int()
    .min(1, 'กรุณาให้คะแนน')
    .max(5, 'คะแนนต้องอยู่ระหว่าง 1-5'),
  comment: z.string().optional(),
  visit_date: z.string().optional(),
})

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'กรุณากรอกชื่อ').max(100),
  bio: z.string().max(500).optional().or(z.literal('')),
  ev_model_id: z.string().uuid().optional().or(z.literal('')),
})
