'use client'

import { useMemo } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'
import { cn } from '@/lib/utils'
import { CheckIcon, XIcon, ChevronsUpDownIcon } from 'lucide-react'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface MotorcycleAutocompleteProps {
  models: VehicleModelOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function MotorcycleAutocomplete({
  models,
  value,
  onValueChange,
  placeholder = 'ค้นหารุ่นมอเตอร์ไซค์...',
  className,
}: MotorcycleAutocompleteProps) {
  const selectedModel = useMemo(
    () => models.find((m) => m.id === value) ?? null,
    [models, value]
  )

  return (
    <Combobox.Root
      items={models}
      value={selectedModel}
      onValueChange={(model) => onValueChange?.(model?.id ?? '')}
      itemToStringLabel={(m) => getModelDisplayName(m.brand, m.model)}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <Combobox.InputGroup
        className={cn(
          'flex h-8 w-full items-center rounded-lg border border-input bg-transparent text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          className
        )}
      >
        <Combobox.Input
          placeholder={placeholder}
          className="flex-1 bg-transparent py-1.5 pr-0 pl-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Combobox.Clear className="flex h-full items-center px-1 text-muted-foreground hover:text-foreground">
          <XIcon className="h-3.5 w-3.5" />
        </Combobox.Clear>
        <Combobox.Icon className="flex h-full items-center pr-2 text-muted-foreground">
          <ChevronsUpDownIcon className="h-3.5 w-3.5" />
        </Combobox.Icon>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="z-50">
          <Combobox.Popup className="max-h-60 w-[var(--anchor-width)] overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <Combobox.List className="p-1">
              <Combobox.Collection>
                {(item) => (
                  <Combobox.Item
                    value={item}
                    className="relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                  >
                    {getModelDisplayName(item.brand, item.model)}
                    <Combobox.ItemIndicator className="absolute right-2">
                      <CheckIcon className="h-4 w-4" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.Collection>
              <Combobox.Empty className="py-4 text-center text-sm text-muted-foreground">
                ไม่พบรุ่นที่ค้นหา
              </Combobox.Empty>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
