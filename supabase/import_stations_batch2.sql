-- =============================================================
-- Import Batch 2: 6 EV Motorcycle Charging Stations
-- วิธีใช้: รันใน Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'e7c3eca5-def5-43e6-b9a4-83bb4aec0acd';
  v_loc_id UUID;
BEGIN

  -- ─── 1. Swap & Go PTT Station (พระราม 4 - สามย่าน) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Swap & Go PTT Station (พระราม 4 - สามย่าน)',
     'สถานีสลับแบตเตอรี่มอเตอร์ไซค์ไฟฟ้า Swap & Go ภายในปั๊ม ปตท. สามย่าน',
     '381 ถ.พระรามที่ 4',
     'กรุงเทพมหานคร', 'เขตปทุมวัน', 'แขวงวังใหม่', '10330',
     ST_SetSRID(ST_MakePoint(100.5283, 13.7335), 4326)::geography,
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

  RAISE NOTICE 'Inserted: Swap & Go PTT Station (พระราม 4 - สามย่าน)';

  -- ─── 2. ETRAN Home (วงศ์สว่าง) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('ETRAN Home (วงศ์สว่าง)',
     'ศูนย์บริการหลักและสถานีสลับแบตเตอรี่สำหรับรถมอเตอร์ไซค์ไฟฟ้า ETRAN',
     '9/9 ถ.วงศ์สว่าง',
     'กรุงเทพมหานคร', 'เขตบางซื่อ', 'แขวงวงศ์สว่าง', '10800',
     ST_SetSRID(ST_MakePoint(100.5287, 13.8284), 4326)::geography,
     'active', 'imported', false, 'ตามแพ็กเกจ ETRAN Swap',
     '08:00-18:00', '02-098-9777', 'https://etrangroup.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: ETRAN Home (วงศ์สว่าง)';

  -- ─── 3. NIU Flagship Store (Thonglor) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('NIU Flagship Store (Thonglor)',
     'โชว์รูมและศูนย์บริการ NIU ประเทศไทย มีจุดเสียบปลั๊กชาร์จ (Portable Charger) บริการสำหรับลูกค้า',
     '888 ซอยสุขุมวิท 55',
     'กรุงเทพมหานคร', 'เขตวัฒนา', 'แขวงคลองตันเหนือ', '10110',
     ST_SetSRID(ST_MakePoint(100.5821, 13.7345), 4326)::geography,
     'active', 'imported', true, 'ฟรีสำหรับลูกค้า NIU',
     '10:00-19:00', '02-130-1077', 'https://www.niuthailand.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Household Plug'), 2, 1.5, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'restroom')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting'));

  RAISE NOTICE 'Inserted: NIU Flagship Store (Thonglor)';

  -- ─── 4. STROM Flagship Store ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('STROM Flagship Store',
     'ศูนย์บริการและจัดจำหน่ายรถมอเตอร์ไซค์ไฟฟ้า STROM',
     '1/11 หมู่ 1 ถ.ติวานนท์',
     'นนทบุรี', 'อำเภอเมืองนนทบุรี', 'ตำบลท่าทราย', '11000',
     ST_SetSRID(ST_MakePoint(100.5182, 13.8765), 4326)::geography,
     'active', 'imported', true, 'ฟรีสำหรับผู้ใช้งานมอเตอร์ไซค์ STROM',
     '09:00-18:00', '02-525-0555', 'https://www.stromthailand.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Household Plug'), 3, 2.0, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'covered')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'security'));

  RAISE NOTICE 'Inserted: STROM Flagship Store';

  -- ─── 5. EV Station PluZ (ปตท. สาขาพุทธมณฑลสาย 4) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('EV Station PluZ (ปตท. สาขาพุทธมณฑลสาย 4)',
     'จุดชาร์จ EV ภายในปั๊ม ปตท. รองรับหัวชาร์จ Type 2 AC (มอเตอร์ไซค์ไฟฟ้าขนาดใหญ่หรือผู้มีสายแปลงสามารถใช้งานได้)',
     'ถ.พุทธมณฑลสาย 4',
     'นครปฐม', 'อำเภอสามพราน', 'ตำบลกระทุ่มล้ม', '73220',
     ST_SetSRID(ST_MakePoint(100.3256, 13.7423), 4326)::geography,
     'active', 'imported', false, '7.50 บาท/kWh (ช่วง Peak) หรือ 5.50 บาท/kWh (ช่วง Off-Peak)',
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

  RAISE NOTICE 'Inserted: EV Station PluZ (ปตท. สาขาพุทธมณฑลสาย 4)';

  -- ─── 6. Gogoro Swapping Station (Ari) ───
  INSERT INTO public.charging_locations
    (name, description, address, province, district, subdistrict, postal_code,
     location, status, source, is_free, price_description,
     operating_hours, contact_phone, website_url, added_by)
  VALUES
    ('Gogoro Swapping Station (Ari)',
     'ตู้สลับแบตเตอรี่ Gogoro Network อำนวยความสะดวกในย่านอารีย์',
     'ซอยอารีย์ 1',
     'กรุงเทพมหานคร', 'เขตพญาไท', 'แขวงพญาไท', '10400',
     ST_SetSRID(ST_MakePoint(100.5432, 13.7801), 4326)::geography,
     'active', 'imported', false, 'คิดค่าบริการตามแพ็กเกจ Gogoro',
     '24 ชม.', '02-116-4446', 'https://network.gogoro.com/', v_user_id)
  RETURNING id INTO v_loc_id;

  INSERT INTO public.location_connectors (location_id, connector_type_id, quantity, power_kw, price_per_kwh)
  VALUES (v_loc_id, (SELECT id FROM public.connector_types WHERE name = 'Proprietary'), 1, null, null);

  INSERT INTO public.location_amenities (location_id, amenity_id) VALUES
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'motorcycle_parking')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = '24hours')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'lighting')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'food')),
    (v_loc_id, (SELECT id FROM public.amenities WHERE name = 'coffee'));

  RAISE NOTICE 'Inserted: Gogoro Swapping Station (Ari)';

END $$;
