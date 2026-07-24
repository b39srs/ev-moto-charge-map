-- =============================================================
-- Import Batch 4: 6 EV Motorcycle Charging Stations
-- วิธีใช้: รันใน Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'e7c3eca5-def5-43e6-b9a4-83bb4aec0acd';
  v_loc_id UUID;
BEGIN

  -- ─── 1. H SEM Power Station (เมเจอร์ รัชโยธิน) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('H SEM Power Station (เมเจอร์ รัชโยธิน)',
     'ตู้สลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า H SEM บริเวณห้างเมเจอร์ ซีนีเพล็กซ์ รัชโยธิน',
     '1839 ถ.พหลโยธิน',
     'กรุงเทพมหานคร', 'เขตจตุจักร', 'แขวงลาดยาว', '10900',
     ST_SetSRID(ST_MakePoint(100.5694, 13.8276), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจใช้งาน H SEM',
     '10:00-22:00', '02-080-5688', 'https://www.hsemmotor.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: H SEM Power Station (เมเจอร์ รัชโยธิน)';

  -- ─── 2. Winnonie Station (บางจาก สุขุมวิท 101/1) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Winnonie Station (บางจาก สุขุมวิท 101/1)',
     'ตู้สลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า Winnonie ณ ปั๊มบางจาก',
     'ถ.สุขุมวิท 101/1',
     'กรุงเทพมหานคร', 'เขตพระโขนง', 'แขวงบางจาก', '10260',
     ST_SetSRID(ST_MakePoint(100.6152, 13.6841), 4326)::geography,
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

  RAISE NOTICE 'Inserted: Winnonie Station (บางจาก สุขุมวิท 101/1)';

  -- ─── 3. EA Anywhere (บิ๊กซี เอ็กซ์ตร้า รัชดาภิเษก) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EA Anywhere (บิ๊กซี เอ็กซ์ตร้า รัชดาภิเษก)',
     'สถานีชาร์จ EA Anywhere มีหัวชาร์จ AC รองรับรถมอเตอร์ไซค์ไฟฟ้าที่ใช้ Type 2',
     '125 ถ.รัชดาภิเษก',
     'กรุงเทพมหานคร', 'เขตดินแดง', 'แขวงดินแดง', '10400',
     ST_SetSRID(ST_MakePoint(100.5704, 13.7709), 4326)::geography,
     'active', 'imported', false, 'AC 87 บาท/ชั่วโมง',
     '09:00-22:00', '02-026-6133', 'https://www.eaanywhere.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 3, 22.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EA Anywhere (บิ๊กซี เอ็กซ์ตร้า รัชดาภิเษก)';

  -- ─── 4. NIU Flagship Store (Chiang Mai) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('NIU Flagship Store (Chiang Mai)',
     'ตัวแทนจำหน่ายรถมอเตอร์ไซค์ไฟฟ้า NIU เชียงใหม่ มีบริการชาร์จไฟสำหรับลูกค้า',
     'ถ.มหิดล',
     'เชียงใหม่', 'อำเภอเมืองเชียงใหม่', 'ตำบลหายยา', '50100',
     ST_SetSRID(ST_MakePoint(98.9836, 18.7735), 4326)::geography,
     'active', 'imported', true, 'ฟรีสำหรับลูกค้า NIU',
     '09:00-18:00', '053-272-888', 'https://www.niuthailand.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Household Plug'), 2, 1.5, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: NIU Flagship Store (Chiang Mai)';

  -- ─── 5. ETRAN Station (สามย่านมิตรทาวน์) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('ETRAN Station (สามย่านมิตรทาวน์)',
     'สถานีสลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า ETRAN บริเวณห้างสามย่านมิตรทาวน์',
     '944 ถ.พระรามที่ 4',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงวังใหม่', '10330',
     ST_SetSRID(ST_MakePoint(100.5285, 13.7336), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ ETRAN Swap',
     '24 ชม.', '02-098-9777', 'https://etrangroup.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: ETRAN Station (สามย่านมิตรทาวน์)';

  -- ─── 6. Swap & Go PTT Station (บางนา-ตราด กม.2) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Swap & Go PTT Station (บางนา-ตราด กม.2)',
     'สถานีสลับแบตเตอรี่สำหรับมอเตอร์ไซค์ไฟฟ้าในเครือ Swap & Go ณ ปั๊ม ปตท.',
     'ถ.บางนา-ตราด กม.2',
     'กรุงเทพมหานคร', 'เขตบางนา', 'แขวงบางนาใต้', '10260',
     ST_SetSRID(ST_MakePoint(100.6234, 13.6685), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจของ Swap & Go',
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

  RAISE NOTICE 'Inserted: Swap & Go PTT Station (บางนา-ตราด กม.2)';

END $$;
