-- =============================================================
-- Import Batch 5: 6 EV Motorcycle Charging Stations
-- วิธีใช้: รันใน Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'e7c3eca5-def5-43e6-b9a4-83bb4aec0acd';
  v_loc_id UUID;
BEGIN

  -- ─── 1. Gogoro Swapping Station (Samyan Mitrtown) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Gogoro Swapping Station (Samyan Mitrtown)',
     'ตู้สลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า Gogoro Network บริเวณสามย่านมิตรทาวน์',
     '944 ถ.พระรามที่ 4',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงวังใหม่', '10330',
     ST_SetSRID(ST_MakePoint(100.5285, 13.7336), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ Gogoro Network',
     '24 ชม.', '02-116-4446', 'https://network.gogoro.com/', v_user_id)
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

  RAISE NOTICE 'Inserted: Gogoro Swapping Station (Samyan Mitrtown)';

  -- ─── 2. Winnonie Station (บางจาก ศรีนครินทร์) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Winnonie Station (บางจาก ศรีนครินทร์)',
     'สถานีสลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า Winnonie ในปั๊มน้ำมันบางจาก ศรีนครินทร์',
     'ถ.ศรีนครินทร์',
     'กรุงเทพมหานคร', 'เขตประเวศ', 'แขวงหนองบอน', '10250',
     ST_SetSRID(ST_MakePoint(100.6482, 13.6821), 4326)::geography,
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

  RAISE NOTICE 'Inserted: Winnonie Station (บางจาก ศรีนครินทร์)';

  -- ─── 3. H SEM Power Station (The Mall Bangkapi) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('H SEM Power Station (The Mall Bangkapi)',
     'ตู้สลับแบตเตอรี่รถมอเตอร์ไซค์ไฟฟ้า H SEM บริเวณศูนย์การค้าเดอะมอลล์ บางกะปิ',
     '3522 ถ.ลาดพร้าว',
     'กรุงเทพมหานคร', 'เขตบางกะปิ', 'แขวงคลองจั่น', '10240',
     ST_SetSRID(ST_MakePoint(100.6429, 13.7661), 4326)::geography,
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

  RAISE NOTICE 'Inserted: H SEM Power Station (The Mall Bangkapi)';

  -- ─── 4. ETRAN Station (La Villa Ari) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('ETRAN Station (La Villa Ari)',
     'สถานีสลับแบตเตอรี่มอเตอร์ไซค์ไฟฟ้า ETRAN บริเวณโครงการลาวิลล่า อารีย์',
     '356 ถ.พหลโยธิน',
     'กรุงเทพมหานคร', 'เขตพญาไท', 'แขวงสามเสนใน', '10400',
     ST_SetSRID(ST_MakePoint(100.5448, 13.7816), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ ETRAN Swap',
     '24 ชม.', '02-098-9777', 'https://etrangroup.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: ETRAN Station (La Villa Ari)';

  -- ─── 5. Swap & Go PTT Station (เกษตร-นวมินทร์) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Swap & Go PTT Station (เกษตร-นวมินทร์)',
     'สถานีสลับแบตเตอรี่มอเตอร์ไซค์ไฟฟ้า Swap & Go ณ ปตท. สาขาประเสริฐมนูกิจ',
     'ถ.ประเสริฐมนูกิจ',
     'กรุงเทพมหานคร', 'เขตลาดพร้าว', 'แขวงจรเข้บัว', '10230',
     ST_SetSRID(ST_MakePoint(100.6123, 13.8291), 4326)::geography,
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

  RAISE NOTICE 'Inserted: Swap & Go PTT Station (เกษตร-นวมินทร์)';

  -- ─── 6. EA Anywhere (The Street Ratchada) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EA Anywhere (The Street Ratchada)',
     'จุดชาร์จรถไฟฟ้า EA Anywhere รองรับมอเตอร์ไซค์ไฟฟ้าที่ใช้หัวชาร์จ AC Type 2 หรือหัวแปลง',
     '139 ถ.รัชดาภิเษก',
     'กรุงเทพมหานคร', 'เขตดินแดง', 'แขวงดินแดง', '10400',
     ST_SetSRID(ST_MakePoint(100.5732, 13.7717), 4326)::geography,
     'active', 'imported', false, 'AC 87 บาท/ชั่วโมง (ตามนโยบายแอปพลิเคชัน)',
     '24 ชม.', '02-026-6133', 'https://www.eaanywhere.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Type 2 (Mennekes)'), 3, 22.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'shopping')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: EA Anywhere (The Street Ratchada)';

END $$;
