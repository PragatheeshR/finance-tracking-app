'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useExportData } from '@/hooks/use-settings'
import { Download, FileJson, Upload, Database, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DataExport() {
  const exportData = useExportData()
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success'>('idle')

  const handleExport = async () => {
    setExportStatus('exporting')
    try {
      await exportData.mutateAsync()
      setExportStatus('success')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      setExportStatus('idle')
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download all your finance data as a JSON file
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileJson className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Export to JSON</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download a complete backup of your data including holdings,
                  expenses, income, budgets, and settings. This file can be used
                  for your records or to import into other systems.
                </p>
                <Button
                  onClick={handleExport}
                  disabled={exportData.isPending || exportStatus === 'exporting'}
                >
                  {exportStatus === 'exporting' ? (
                    <>
                      <Download className="mr-2 h-4 w-4 animate-bounce" />
                      Exporting...
                    </>
                  ) : exportStatus === 'success' ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exported Successfully!
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Import Data</h3>
          <p className="text-sm text-muted-foreground">
            Import data from a JSON file (coming soon)
          </p>
        </div>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Import from JSON</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a previously exported JSON file to restore your data.
                  This feature is coming soon.
                </p>
                <Button disabled variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Info */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>About Your Data</AlertTitle>
        <AlertDescription>
          Your data is stored securely in our database. Exporting creates a
          complete backup that you can keep for your records. The JSON file
          contains all your financial data in a structured format.
        </AlertDescription>
      </Alert>

      {/* Warning Box */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Privacy Notice</AlertTitle>
        <AlertDescription>
          The exported file contains all your financial data including account
          balances, transactions, and personal information. Please store this
          file securely and do not share it with unauthorized parties.
        </AlertDescription>
      </Alert>

      {/* Export Format Info */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h4 className="font-medium mb-2">Export Format</h4>
        <p className="text-sm text-muted-foreground mb-3">
          The exported JSON file includes the following sections:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>User profile information</li>
          <li>Settings and preferences</li>
          <li>Portfolio holdings and allocations</li>
          <li>All expense records</li>
          <li>All income records</li>
          <li>Budget items and categories</li>
          <li>Custom expense categories</li>
        </ul>
      </div>
    </div>
  )
}
