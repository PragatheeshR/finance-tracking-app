'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertCircle } from 'lucide-react'

interface InsuranceCalendarProps {
  policies: any[]
}

export function InsuranceCalendar({ policies }: InsuranceCalendarProps) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Get next 6 months
  const months = []
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    months.push({
      name: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      month: date.getMonth(),
      year: date.getFullYear(),
    })
  }

  const getPoliciesForMonth = (month: number, year: number) => {
    return policies.filter((policy) => {
      if (!policy.validTill && !policy.premiumDueDate) return false

      const checkDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.getMonth() === month && date.getFullYear() === year
      }

      return (
        (policy.validTill && checkDate(policy.validTill)) ||
        (policy.premiumDueDate && checkDate(policy.premiumDueDate))
      )
    })
  }

  const getEventType = (policy: any, month: number, year: number) => {
    const events = []

    if (policy.validTill) {
      const date = new Date(policy.validTill)
      if (date.getMonth() === month && date.getFullYear() === year) {
        events.push({
          type: 'renewal',
          date: date.getDate(),
          label: 'Renewal',
        })
      }
    }

    if (policy.premiumDueDate) {
      const date = new Date(policy.premiumDueDate)
      if (date.getMonth() === month && date.getFullYear() === year) {
        events.push({
          type: 'premium',
          date: date.getDate(),
          label: 'Premium Due',
        })
      }
    }

    return events
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {months.map((monthInfo) => {
              const monthPolicies = getPoliciesForMonth(
                monthInfo.month,
                monthInfo.year
              )

              return (
                <Card key={`${monthInfo.month}-${monthInfo.year}`} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{monthInfo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monthPolicies.length > 0 ? (
                      <div className="space-y-3">
                        {monthPolicies.map((policy) => {
                          const events = getEventType(
                            policy,
                            monthInfo.month,
                            monthInfo.year
                          )

                          return events.map((event, idx) => (
                            <div
                              key={`${policy.id}-${idx}`}
                              className="p-3 rounded-lg border bg-card"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-medium text-sm">
                                  {policy.policyName}
                                </p>
                                <Badge
                                  variant={
                                    event.type === 'renewal'
                                      ? 'destructive'
                                      : 'default'
                                  }
                                  className="text-xs"
                                >
                                  {event.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(
                                    monthInfo.year,
                                    monthInfo.month,
                                    event.date
                                  ).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                              {policy.premiumAmount && event.type === 'premium' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Amount: ₹
                                  {parseFloat(policy.premiumAmount).toLocaleString(
                                    'en-IN'
                                  )}
                                </p>
                              )}
                            </div>
                          ))
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No events this month</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calendar Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                Renewal
              </Badge>
              <span className="text-sm text-muted-foreground">
                Policy expiry/renewal date
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                Premium Due
              </Badge>
              <span className="text-sm text-muted-foreground">
                Premium payment due date
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
