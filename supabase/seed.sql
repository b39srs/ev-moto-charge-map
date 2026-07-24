-- Connector types common in Thailand for EV motorcycles
INSERT INTO public.connector_types (name, display_name, description, power_type, is_common_for_motorcycle) VALUES
  ('Type 1 (J1772)', 'ไทป์ 1 (J1772)', 'มาตรฐานอเมริกัน/ญี่ปุ่น AC', 'AC', false),
  ('Type 2 (Mennekes)', 'ไทป์ 2 (Mennekes)', 'มาตรฐานยุโรป AC', 'AC', false),
  ('CCS1', 'CCS1', 'Combined Charging System แบบ 1', 'DC', false),
  ('CCS2', 'CCS2', 'Combined Charging System แบบ 2', 'DC', false),
  ('CHAdeMO', 'ชาเดโม', 'มาตรฐานญี่ปุ่น DC', 'DC', false),
  ('GB/T', 'GB/T', 'มาตรฐานจีน', 'DC', false),
  ('Household Plug', 'ปลั๊กบ้าน', 'เต้าเสียบมาตรฐานไทย 220V', 'AC', true),
  ('Portable Charger', 'ที่ชาร์จพกพา', 'ที่ชาร์จพกพาจากผู้ผลิต', 'AC', true),
  ('Proprietary', 'เฉพาะรุ่น', 'หัวชาร์จเฉพาะของผู้ผลิต', 'AC', true);

-- Common amenities
INSERT INTO public.amenities (name, display_name, icon, category) VALUES
  ('parking', 'ที่จอดรถ', 'circle-parking', 'facility'),
  ('restroom', 'ห้องน้ำ', 'bath', 'facility'),
  ('wifi', 'Wi-Fi', 'wifi', 'facility'),
  ('food', 'ร้านอาหาร', 'utensils', 'nearby'),
  ('coffee', 'ร้านกาแฟ', 'coffee', 'nearby'),
  ('convenience_store', 'ร้านสะดวกซื้อ', 'store', 'nearby'),
  ('covered', 'มีหลังคา', 'umbrella', 'feature'),
  ('24hours', 'เปิด 24 ชม.', 'clock', 'feature'),
  ('security', 'มีรปภ.', 'shield-check', 'safety'),
  ('lighting', 'มีไฟส่องสว่าง', 'lightbulb', 'safety'),
  ('motorcycle_parking', 'ที่จอดมอเตอร์ไซค์', 'bike', 'facility'),
  ('shopping', 'ห้างสรรพสินค้า', 'shopping-cart', 'nearby');
