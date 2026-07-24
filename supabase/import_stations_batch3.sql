-- =============================================================
-- Import Batch 3: 6 EV Motorcycle Charging Stations
-- วิธีใช้: รันใน Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'e7c3eca5-def5-43e6-b9a4-83bb4aec0acd';
  v_loc_id UUID;
BEGIN

  -- ─── 1. Winnonie Station (บางจาก สุขุมวิท 62) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Winnonie Station (บางจาก สุขุมวิท 62)',
     'สถานีสลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า Winnonie ภายในปั๊มน้ำมันบางจาก',
     'ซอยสุขุมวิท 62 ถ.สุขุมวิท',
     'กรุงเทพมหานคร', 'เขตพระโขนง', 'แขวงบางจาก', '10260',
     ST_SetSRID(ST_MakePoint(100.6033, 13.6967), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจเช่าหรือใช้งานเครือข่าย Winnonie',
     '24 ชม.', '1651', 'https://www.winnonie.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'convenience_store')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: Winnonie Station (บางจาก สุขุมวิท 62)';

  -- ─── 2. H SEM Power Station (CU Sport Complex) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('H SEM Power Station (CU Sport Complex)',
     'ตู้สลับแบตเตอรี่สำหรับรถมอเตอร์ไซค์ไฟฟ้า H SEM ภายในพื้นที่จุฬาลงกรณ์มหาวิทยาลัย',
     'ศูนย์กีฬาแห่งจุฬาลงกรณ์มหาวิทยาลัย ซอยจุฬาฯ 9',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงวังใหม่', '10330',
     ST_SetSRID(ST_MakePoint(100.5255, 13.7385), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจใช้งาน H SEM',
     '24 ชม.', '02-080-5688', 'https://www.hsemmotor.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: H SEM Power Station (CU Sport Complex)';

  -- ─── 3. SHARGE (Siam Paragon) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('SHARGE (Siam Paragon)',
     'สถานีชาร์จพลังงานไฟฟ้า รองรับมอเตอร์ไซค์ไฟฟ้าที่มีสายชาร์จหัว Type 2 หรือหัวแปลง AC',
     '991 ถ.พระรามที่ 1 (ลานจอดรถชั้น B1)',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงปทุมวัน', '10330',
     ST_SetSRID(ST_MakePoint(100.5348, 13.7461), 4326)::geography,
     'active', 'imported', false, 'อัตราค่าชาร์จตามประกาศในแอปพลิเคชัน SHARGE',
     '10:00-22:00', '02-114-3329', 'https://shargemanagement.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 4, 22.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: SHARGE (Siam Paragon)';

  -- ─── 4. Deco Station (เชียงใหม่ มอเตอร์ไบค์) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Deco Station (เชียงใหม่ มอเตอร์ไบค์)',
     'ตัวแทนจำหน่ายมอเตอร์ไซค์ไฟฟ้า Deco พร้อมจุดเสียบปลั๊กชาร์จ (Household Plug) สำหรับผู้ใช้บริการ',
     '99/9 ถ.เชียงใหม่-หางดง',
     'เชียงใหม่', 'อำเภอเมืองเชียงใหม่', 'ตำบลแม่เหียะ', '50100',
     ST_SetSRID(ST_MakePoint(98.9632, 18.7564), 4326)::geography,
     'active', 'imported', true, 'ฟรีสำหรับลูกค้ามอเตอร์ไซค์ไฟฟ้า Deco',
     '08:30-17:30', '053-272-888', 'https://decogreenenergy.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Household Plug'), 2, 2.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: Deco Station (เชียงใหม่ มอเตอร์ไบค์)';

  -- ─── 5. Swap & Go PTT Station (แคราย) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Swap & Go PTT Station (แคราย)',
     'สถานีสลับแบตเตอรี่มอเตอร์ไซค์ไฟฟ้า Swap & Go ณ ปตท. สาขาแคราย',
     'ถ.ติวานนท์',
     'นนทบุรี', 'อำเภอเมืองนนทบุรี', 'ตำบลตลาดขวัญ', '11000',
     ST_SetSRID(ST_MakePoint(100.5215, 13.8584), 4326)::geography,
     'active', 'imported', false, 'คิดค่าบริการตามแพ็กเกจของ Swap & Go',
     '24 ชม.', '1365', 'https://www.swapandgo.co/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'convenience_store')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: Swap & Go PTT Station (แคราย)';

  -- ─── 6. EV Station PluZ (ปตท. สาขาพระราม 9 - เอกมัย) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EV Station PluZ (ปตท. สาขาพระราม 9 - เอกมัย)',
     'จุดชาร์จรถไฟฟ้าที่มีหัวชาร์จ AC Type 2 สามารถใช้งานกับมอเตอร์ไซค์ไฟฟ้าขนาดใหญ่ได้',
     'ถ.พระราม 9',
     'กรุงเทพมหานคร', 'เขตห้วยขวาง', 'แขวงบางกะปิ', '10310',
     ST_SetSRID(ST_MakePoint(100.5800, 13.7540), 4326)::geography,
     'active', 'imported', false, '7.50 บาท/kWh (Peak) หรือ 5.50 บาท/kWh (Off-Peak)',
     '24 ชม.', '1365', 'https://evstationpluz.pttor.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 1, 22.0, 7.50);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'convenience_store')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EV Station PluZ (ปตท. สาขาพระราม 9 - เอกมัย)';

END $$;
