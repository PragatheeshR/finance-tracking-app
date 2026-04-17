'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { Loader2, Moon, Sun } from 'lucide-react'

interface PreferencesFormData {
  currency: string
  dateFormat: string
  theme: string
  showEmptyStates: boolean
}

export function PreferencesSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const { theme: currentTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const { watch, setValue, handleSubmit } = useForm<PreferencesFormData>({
    defaultValues: {
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light',
      showEmptyStates: true,
    },
  })

  const formTheme = watch('theme')
  const showEmptyStates = watch('showEmptyStates')

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (settings && mounted) {
      setValue('currency', settings.currency)
      setValue('dateFormat', settings.dateFormat)
      setValue('theme', settings.theme)
      setValue('showEmptyStates', settings.showEmptyStates)
      // Apply theme when settings load
      setTheme(settings.theme)
    }
  }, [settings, setValue, setTheme, mounted])

  const handleThemeChange = (newTheme: string) => {
    console.log('Theme change requested:', newTheme)
    console.log('Current theme before:', currentTheme)
    setValue('theme', newTheme)
    setTheme(newTheme) // Apply theme immediately
    console.log('setTheme called with:', newTheme)
  }

  const onSubmit = async (data: PreferencesFormData) => {
    await updateSettings.mutateAsync(data)
  }

  // Don't render theme buttons until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Currency */}
      <div className="space-y-2">
        <Label>Default Currency</Label>
        <Select
          value={watch('currency')}
          onValueChange={(value) => setValue('currency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">₹ INR - Indian Rupee</SelectItem>
            <SelectItem value="USD">$ USD - US Dollar</SelectItem>
            <SelectItem value="EUR">€ EUR - Euro</SelectItem>
            <SelectItem value="GBP">£ GBP - British Pound</SelectItem>
            <SelectItem value="JPY">¥ JPY - Japanese Yen</SelectItem>
            <SelectItem value="AUD">A$ AUD - Australian Dollar</SelectItem>
            <SelectItem value="CAD">C$ CAD - Canadian Dollar</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This currency will be used throughout the app
        </p>
      </div>

      {/* Date Format */}
      <div className="space-y-2">
        <Label>Date Format</Label>
        <Select
          value={watch('dateFormat')}
          onValueChange={(value) => setValue('dateFormat', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</SelectItem>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</SelectItem>
            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</SelectItem>
            <SelectItem value="DD MMM YYYY">DD MMM YYYY (31 Dec 2026)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose how dates are displayed across the app
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              formTheme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              formTheme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              formTheme === 'system'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex">
              <Sun className="h-6 w-6 -mr-2" />
              <Moon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose your preferred theme or sync with system settings
        </p>
      </div>

      {/* Display Options */}
      <div className="space-y-4">
        <Label>Display Options</Label>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="font-medium">Show Empty States</div>
            <div className="text-sm text-muted-foreground">
              Display helpful messages when there's no data
            </div>
          </div>
          <Switch
            checked={showEmptyStates}
            onCheckedChange={(checked) => setValue('showEmptyStates', checked)}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </form>
  )
}
