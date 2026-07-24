-- =============================================================
-- Import 6 EV Motorcycle Charging Stations
-- วิธีใช้: เปลี่ยน v_user_id เป็น UUID ของคุณ แล้วรันใน Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'e7c3eca5-def5-43e6-b9a4-83bb4aec0acd';
  v_loc_id UUID;
BEGIN

  -- ─── 1. Gogoro Swapping Station (Cub House Ekamai) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Gogoro Swapping Station (Cub House Ekamai)',
     'สถานีสลับแบตเตอรี่มอเตอร์ไซค์ไฟฟ้า Gogoro Network',
     '85 ซอยเอกมัย 3',
     'กรุงเทพมหานคร', 'เขตวัฒนา', 'แขวงคลองตันเหนือ', '10110',
     ST_SetSRID(ST_MakePoint(100.5843, 13.7291), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ Gogoro Network',
     '24 ชม.', '02-116-4446', 'https://network.gogoro.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: Gogoro Swapping Station (Cub House Ekamai)';

  -- ─── 2. HMC E-bike Station by HMC (Deco Dealer) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('HMC E-bike Station by HMC (Deco Dealer)',
     'ศูนย์จัดจำหน่ายและจุดชาร์จมอเตอร์ไซค์ไฟฟ้า Deco',
     '164 ถ.เทียนจ่ออุทิศ 2',
     'สงขลา', 'อำเภอหาดใหญ่', 'ตำบลหาดใหญ่', '90110',
     ST_SetSRID(ST_MakePoint(100.4735, 7.0094), 4326)::geography,
     'active', 'imported', true, 'ฟรีสำหรับลูกค้า Deco / บุคคลทั่วไปสอบถามศูนย์บริการ',
     '09:00-18:00', '093-265-4647', 'https://hmcebike.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Household Plug'), 2, 2.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered'));

  RAISE NOTICE 'Inserted: HMC E-bike Station by HMC (Deco Dealer)';

  -- ─── 3. EA Anywhere (Central World) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EA Anywhere (Central World)',
     'สถานีชาร์จ EA Anywhere ในห้างสรรพสินค้า (มอเตอร์ไซค์ไฟฟ้าสามารถใช้ได้หากมีสาย Type 2 หรือหัวแปลง)',
     '999/9 ถ. พระรามที่ 1',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงปทุมวัน', '10330',
     ST_SetSRID(ST_MakePoint(100.5393, 13.7468), 4326)::geography,
     'active', 'imported', false, 'AC 87 บาท/ชั่วโมง (ตามนโยบายแอปพลิเคชัน)',
     '10:00-22:00', '02-026-6133', 'https://www.eaanywhere.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 4, 22.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EA Anywhere (Central World)';

  -- ─── 4. Gogoro Swapping Station (MEA Bang Na) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Gogoro Swapping Station (MEA Bang Na)',
     'สถานีสลับแบตเตอรี่ Gogoro ณ การไฟฟ้านครหลวง เขตบางนา',
     '556 ถนนสรรพาวุธ',
     'กรุงเทพมหานคร', 'เขตบางนา', 'แขวงบางนาเหนือ', '10260',
     ST_SetSRID(ST_MakePoint(100.5986, 13.6732), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ Gogoro Network',
     '24 ชม.', '02-769-3200', 'https://network.gogoro.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: Gogoro Swapping Station (MEA Bang Na)';

  -- ─── 5. EVOLT (Hard Rock Hotel Pattaya) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EVOLT (Hard Rock Hotel Pattaya)',
     'สถานีชาร์จ Evolt รองรับทั้งรถยนต์และมอเตอร์ไซค์ไฟฟ้าที่ใช้ Type 2',
     '429 หมู่ที่ 9 ถนนพัทยาสาย 2',
     'ชลบุรี', 'อำเภอบางละมุง', 'ตำบลหนองปรือ', '20150',
     ST_SetSRID(ST_MakePoint(100.8847, 12.9372), 4326)::geography,
     'active', 'imported', false, '10 บาท/kWh',
     '24 ชม.', '038-428-755', 'https://evolt.co.th/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 6, 7.4, 10.0);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'wifi')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EVOLT (Hard Rock Hotel Pattaya)';

  -- ─── 6. Swap & Go PTT Station (วิภาวดีรังสิต) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Swap & Go PTT Station (วิภาวดีรังสิต)',
     'สถานีสลับแบตเตอรี่สำหรับมอเตอร์ไซค์ไฟฟ้าในเครือ Swap & Go',
     'ปตท. สาขาวิภาวดีรังสิต',
     'กรุงเทพมหานคร', 'เขตจตุจักร', 'แขวงจตุจักร', '10900',
     ST_SetSRID(ST_MakePoint(100.5562, 13.8214), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ Swap & Go',
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

  RAISE NOTICE 'Inserted: Swap & Go PTT Station (วิภาวดีรังสิต)';

END $$;
