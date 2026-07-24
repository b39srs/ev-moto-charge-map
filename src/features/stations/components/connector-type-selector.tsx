'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { ConnectorType } from '@/types/entities'

interface ConnectorTypeSelectorProps {
  connectorTypes: ConnectorType[]
  error?: string
  defaultSelectedIds?: string[]
}

export function ConnectorTypeSelector({
  connectorTypes,
  error,
  defaultSelectedIds = [],
}: ConnectorTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        ประเภทหัวชาร์จ<span className="ml-0.5 text-destructive">*</span>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {connectorTypes.map((ct) => (
          <label
            key={ct.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent"
          >
            <Checkbox name="connector_type_ids" value={ct.id} defaultChecked={defaultSelectedIds.includes(ct.id)} />
            <div className="flex-1">
              <span className="text-sm font-medium">{ct.display_name}</span>
              <div className="flex gap-1 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  {ct.power_type}
                </Badge>
                {ct.is_common_for_motorcycle && (
                  <Badge className="text-xs">มอเตอร์ไซค์</Badge>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
