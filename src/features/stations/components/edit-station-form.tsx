'use client'

import { useActionState } from 'react'
import { updateStation } from '@/features/stations/actions/station-actions'
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

interface EditStationFormProps {
  stationId: string
  connectorTypes: ConnectorType[]
  amenities: Amenity[]
  defaultValues: {
    name: string
    address: string
    province: string
    district: string | null
    description: string | null
    operating_hours: string | null
    contact_phone: string | null
    website_url: string | null
    is_free: boolean
    price_description: string | null
    latitude: number
    longitude: number
    connectorTypeIds: string[]
    amenityIds: string[]
  }
}

export function EditStationForm({
  stationId,
  connectorTypes,
  amenities,
  defaultValues,
}: EditStationFormProps) {
  const [state, formAction] = useActionState(updateStation, null)
  const [isFree, setIsFree] = useState(defaultValues.is_free)
  const [province, setProvince] = useState(defaultValues.province)
  const [latitude, setLatitude] = useState<number | ''>(defaultValues.latitude)
  const [longitude, setLongitude] = useState<number | ''>(defaultValues.longitude)

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }, [])

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="station_id" value={stationId} />

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสถานีชาร์จ</CardTitle>
          <CardDescription>แก้ไขข้อมูลสถานีชาร์จ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="ชื่อสถานี" required error={state?.errors?.name?.[0]}>
            <Input name="name" defaultValue={defaultValues.name} required />
          </FormField>

          <FormField label="ที่อยู่" required error={state?.errors?.address?.[0]}>
            <Input name="address" defaultValue={defaultValues.address} required />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="จังหวัด" required error={state?.errors?.province?.[0]}>
              <input type="hidden" name="province" value={province} />
              <Select value={province} onValueChange={(v) => setProvince(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent>
                  {THAI_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="อำเภอ/เขต">
              <Input name="district" defaultValue={defaultValues.district ?? ''} />
            </FormField>
          </div>

          <FormField label="รายละเอียด">
            <Textarea
              name="description"
              defaultValue={defaultValues.description ?? ''}
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="เวลาเปิด-ปิด">
              <Input name="operating_hours" defaultValue={defaultValues.operating_hours ?? ''} />
            </FormField>
            <FormField label="เบอร์โทรติดต่อ">
              <Input name="contact_phone" defaultValue={defaultValues.contact_phone ?? ''} />
            </FormField>
          </div>

          <FormField label="เว็บไซต์" error={state?.errors?.website_url?.[0]}>
            <Input name="website_url" type="url" defaultValue={defaultValues.website_url ?? ''} />
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
                defaultValue={defaultValues.price_description ?? ''}
                rows={2}
              />
            </FormField>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตำแหน่งที่ตั้ง</CardTitle>
          <CardDescription>คลิกบนแผนที่หรือกรอกพิกัด GPS</CardDescription>
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
            <FormField label="ละติจูด (Latitude)" required error={state?.errors?.latitude?.[0]}>
              <Input
                name="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : '')}
                required
              />
            </FormField>
            <FormField label="ลองจิจูด (Longitude)" required error={state?.errors?.longitude?.[0]}>
              <Input
                name="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : '')}
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
            defaultSelectedIds={defaultValues.connectorTypeIds}
          />
          <Separator />
          <AmenitySelector
            amenities={amenities}
            defaultSelectedIds={defaultValues.amenityIds}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เพิ่มรูปภาพ</CardTitle>
          <CardDescription>อัปโหลดรูปเพิ่มเติม (รูปเดิมจะยังอยู่)</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploader />
        </CardContent>
      </Card>

      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton className="w-full" size="lg">
        บันทึกการแก้ไข
      </SubmitButton>
    </form>
  )
}
