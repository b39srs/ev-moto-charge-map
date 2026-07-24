'use client'

import { useActionState } from 'react'
import { createStation } from '@/features/stations/actions/station-actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { ConnectorTypeSelector } from './connector-type-selector'
import { AmenitySelector } from './amenity-selector'
import { PhotoUploader } from './photo-uploader'
import { THAI_PROVINCES } from '@/lib/constants'
import type { ConnectorType, Amenity } from '@/types/entities'
import { useState, useCallback } from 'react'
import { GoogleMapsProvider } from '@/components/map/google-maps-provider'
import { LocationPicker } from '@/features/map/components/location-picker'

interface AddStationFormProps {
  connectorTypes: ConnectorType[]
  amenities: Amenity[]
}

export function AddStationForm({
  connectorTypes,
  amenities,
}: AddStationFormProps) {
  const [state, formAction] = useActionState(createStation, null)
  const [isFree, setIsFree] = useState(false)
  const [province, setProvince] = useState('')
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }, [])

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสถานีชาร์จ</CardTitle>
          <CardDescription>
            กรอกข้อมูลเพื่อเพิ่มสถานีชาร์จใหม่ให้ชุมชน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="ชื่อสถานี"
            required
            error={state?.errors?.name?.[0]}
          >
            <Input name="name" placeholder="เช่น ร้านกาแฟ ABC" required />
          </FormField>

          <FormField
            label="ที่อยู่"
            required
            error={state?.errors?.address?.[0]}
          >
            <Input name="address" placeholder="ที่อยู่เต็ม" required />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="จังหวัด"
              required
              error={state?.errors?.province?.[0]}
            >
              <input type="hidden" name="province" value={province} />
              <Select value={province} onValueChange={(v) => setProvince(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent>
                  {THAI_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="อำเภอ/เขต">
              <Input name="district" placeholder="อำเภอ/เขต" />
            </FormField>
          </div>

          <FormField label="รายละเอียด">
            <Textarea
              name="description"
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสถานีชาร์จ"
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="เวลาเปิด-ปิด">
              <Input
                name="operating_hours"
                placeholder="เช่น 08:00-20:00"
              />
            </FormField>
            <FormField label="เบอร์โทรติดต่อ">
              <Input name="contact_phone" placeholder="0xx-xxx-xxxx" />
            </FormField>
          </div>

          <FormField label="เว็บไซต์" error={state?.errors?.website_url?.[0]}>
            <Input
              name="website_url"
              type="url"
              placeholder="https://..."
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ราคาและค่าบริการ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2">
            <Checkbox
              name="is_free_checkbox"
              checked={isFree}
              onCheckedChange={(checked) => setIsFree(checked === true)}
            />
            <span className="text-sm font-medium">ชาร์จฟรี</span>
          </label>
          <input type="hidden" name="is_free" value={String(isFree)} />

          {!isFree && (
            <FormField label="รายละเอียดราคา">
              <Textarea
                name="price_description"
                placeholder="เช่น 3 บาท/kWh หรือ ฟรี 2 ชม.แรก"
                rows={2}
              />
            </FormField>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตำแหน่งที่ตั้ง</CardTitle>
          <CardDescription>
            คลิกบนแผนที่หรือกรอกพิกัด GPS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleMapsProvider>
            <LocationPicker
              latitude={latitude || undefined}
              longitude={longitude || undefined}
              onLocationChange={handleLocationChange}
            />
          </GoogleMapsProvider>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="ละติจูด (Latitude)"
              required
              error={state?.errors?.latitude?.[0]}
            >
              <Input
                name="latitude"
                type="number"
                step="any"
                placeholder="เช่น 13.7563"
                value={latitude}
                onChange={(e) =>
                  setLatitude(e.target.value ? parseFloat(e.target.value) : '')
                }
                required
              />
            </FormField>
            <FormField
              label="ลองจิจูด (Longitude)"
              required
              error={state?.errors?.longitude?.[0]}
            >
              <Input
                name="longitude"
                type="number"
                step="any"
                placeholder="เช่น 100.5018"
                value={longitude}
                onChange={(e) =>
                  setLongitude(e.target.value ? parseFloat(e.target.value) : '')
                }
                required
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>หัวชาร์จและสิ่งอำนวยความสะดวก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConnectorTypeSelector
            connectorTypes={connectorTypes}
            error={state?.errors?.connector_type_ids?.[0]}
          />

          <Separator />

          <AmenitySelector amenities={amenities} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รูปภาพ</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader />
        </CardContent>
      </Card>

      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton className="w-full" size="lg">
        เพิ่มสถานีชาร์จ
      </SubmitButton>
    </form>
  )
}
