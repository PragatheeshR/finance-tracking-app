'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { Loader2, Mail, Smartphone, Bell, Calendar } from 'lucide-react'

interface NotificationPreferences {
  email: boolean
  push: boolean
  budgetAlerts: boolean
  recurringReminders: boolean
}

export function NotificationSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    push: false,
    budgetAlerts: true,
    recurringReminders: true,
  })

  useEffect(() => {
    if (settings?.notifications) {
      setNotifications({
        email: settings.notifications.email ?? true,
        push: settings.notifications.push ?? false,
        budgetAlerts: settings.notifications.budgetAlerts ?? true,
        recurringReminders: settings.notifications.recurringReminders ?? true,
      })
    }
  }, [settings])

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      notifications,
    })
  }

  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="space-y-4">
        <Label>Notification Channels</Label>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive notifications via email
              </div>
            </div>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={(checked) => updateNotification('email', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </div>
            </div>
          </div>
          <Switch
            checked={notifications.push}
            onCheckedChange={(checked) => updateNotification('push', checked)}
            disabled
          />
        </div>
        <p className="text-xs text-muted-foreground pl-4">
          Push notifications coming soon
        </p>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <Label>Notification Types</Label>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Bell className="h-5 w-5 text-orange-500" />
            </div>
            <div className="space-y-0.5">
              <div className="font-medium">Budget Alerts</div>
              <div className="text-sm text-muted-foreground">
                Get notified when you're close to budget limits
              </div>
            </div>
          </div>
          <Switch
            checked={notifications.budgetAlerts}
            onCheckedChange={(checked) => updateNotification('budgetAlerts', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-0.5">
              <div className="font-medium">Recurring Reminders</div>
              <div className="text-sm text-muted-foreground">
                Reminders for recurring expenses and income
              </div>
            </div>
          </div>
          <Switch
            checked={notifications.recurringReminders}
            onCheckedChange={(checked) =>
              updateNotification('recurringReminders', checked)
            }
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          About Notifications
        </h4>
        <p className="text-sm text-muted-foreground">
          You can customize which notifications you receive and how you receive them.
          Budget alerts will notify you when you reach 80% and 100% of your budget limits.
          Recurring reminders help you stay on top of regular income and expenses.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Notification Settings'
          )}
        </Button>
      </div>
    </div>
  )
}
