-- =============================================================
-- Import Batch 6: 6 EV Motorcycle Charging Stations
-- วิธีใช้: รันใน Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'e7c3eca5-def5-43e6-b9a4-83bb4aec0acd';
  v_loc_id UUID;
BEGIN

  -- ─── 1. Swap & Go PTT Station (ลาดพร้าว-วังหิน) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Swap & Go PTT Station (ลาดพร้าว-วังหิน)',
     'สถานีสลับแบตเตอรี่มอเตอร์ไซค์ไฟฟ้า Swap & Go ภายในปั๊ม ปตท. สาขาลาดพร้าว-วังหิน',
     'ถ.ลาดพร้าววังหิน',
     'กรุงเทพมหานคร', 'เขตลาดพร้าว', 'แขวงลาดพร้าว', '10230',
     ST_SetSRID(ST_MakePoint(100.5912, 13.8189), 4326)::geography,
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

  RAISE NOTICE 'Inserted: Swap & Go PTT Station (ลาดพร้าว-วังหิน)';

  -- ─── 2. Winnonie Station (บางจาก วิภาวดีรังสิต) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Winnonie Station (บางจาก วิภาวดีรังสิต)',
     'ตู้สลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า Winnonie ณ ปั๊มน้ำมันบางจาก ริมถนนวิภาวดีรังสิต',
     'ถ.วิภาวดีรังสิต',
     'กรุงเทพมหานคร', 'เขตจตุจักร', 'แขวงจตุจักร', '10900',
     ST_SetSRID(ST_MakePoint(100.5598, 13.8321), 4326)::geography,
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

  RAISE NOTICE 'Inserted: Winnonie Station (บางจาก วิภาวดีรังสิต)';

  -- ─── 3. Gogoro Swapping Station (MEA Bang Khen) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Gogoro Swapping Station (MEA Bang Khen)',
     'สถานีสลับแบตเตอรี่ Gogoro Network พื้นที่การไฟฟ้านครหลวง เขตบางเขน',
     'ถ.งามวงศ์วาน',
     'กรุงเทพมหานคร', 'เขตจตุจักร', 'แขวงลาดยาว', '10900',
     ST_SetSRID(ST_MakePoint(100.5567, 13.8432), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ Gogoro Network',
     '24 ชม.', '02-116-4446', 'https://network.gogoro.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: Gogoro Swapping Station (MEA Bang Khen)';

  -- ─── 4. Deco Station (Deco Phuket) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Deco Station (Deco Phuket)',
     'โชว์รูมตัวแทนจำหน่ายรถมอเตอร์ไซค์ไฟฟ้า Deco ภูเก็ต พร้อมจุดเสียบปลั๊กชาร์จ',
     'ถ.เทพกระษัตรี',
     'ภูเก็ต', 'อำเภอเมืองภูเก็ต', 'ตำบลรัษฎา', '83000',
     ST_SetSRID(ST_MakePoint(98.3962, 7.9056), 4326)::geography,
     'active', 'imported', true, 'ฟรีสำหรับผู้ใช้งานมอเตอร์ไซค์ไฟฟ้า Deco',
     '09:00-18:00', '076-211-111', 'https://decogreenenergy.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Household Plug'), 2, 2.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: Deco Station (Deco Phuket)';

  -- ─── 5. EA Anywhere (Siam Square One) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EA Anywhere (Siam Square One)',
     'สถานีชาร์จ EA Anywhere ในห้างสยามสแควร์วัน รองรับมอเตอร์ไซค์ไฟฟ้าที่มีหัวชาร์จ AC Type 2',
     '388 ถ.พระรามที่ 1 (ลานจอดรถใต้ดิน)',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงปทุมวัน', '10330',
     ST_SetSRID(ST_MakePoint(100.5337, 13.7455), 4326)::geography,
     'active', 'imported', false, 'AC 87 บาท/ชั่วโมง',
     '10:00-22:00', '02-026-6133', 'https://www.eaanywhere.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 3, 22.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EA Anywhere (Siam Square One)';

  -- ─── 6. EVOLT (Chamchuri Square) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EVOLT (Chamchuri Square)',
     'สถานีชาร์จ Evolt ชั้นใต้ดินจามจุรีสแควร์ รองรับรถมอเตอร์ไซค์ไฟฟ้าที่ใช้หัวชาร์จมาตรฐาน Type 2',
     '315 ถ.พระรามที่ 4',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงปทุมวัน', '10330',
     ST_SetSRID(ST_MakePoint(100.5298, 13.7330), 4326)::geography,
     'active', 'imported', false, 'อัตราค่าบริการตามประกาศในแอปพลิเคชัน Evolt',
     '06:00-22:00', '02-114-7343', 'https://evolt.co.th/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 2, 7.4, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EVOLT (Chamchuri Square)';

END $$;
