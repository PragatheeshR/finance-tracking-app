'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAssetCategories } from '@/hooks/use-categories'
import { useAddHolding, useUpdateHolding } from '@/hooks/use-portfolio'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { StockSymbolCombobox } from './stock-symbol-combobox'

const holdingSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(255),
  symbol: z.string().max(50).optional(),
  subCategory: z.string().max(100).optional(),
  units: z.string().min(1, 'Units is required'),
  unitPrice: z.string().min(1, 'Unit price is required'),
  purchaseDate: z.string().optional(),
  remarks: z.string().max(500).optional(),
})

type HoldingFormData = z.infer<typeof holdingSchema>

interface HoldingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  holding?: any // Existing holding for edit mode
}

export function HoldingDialog({
  open,
  onOpenChange,
  holding,
}: HoldingDialogProps) {
  const isEditMode = !!holding
  const { data: categories, isLoading: categoriesLoading } = useAssetCategories()
  const addHolding = useAddHolding()
  const updateHolding = useUpdateHolding()
  const [fetchingPrice, setFetchingPrice] = useState(false)

  const form = useForm<HoldingFormData>({
    resolver: zodResolver(holdingSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      symbol: '',
      subCategory: '',
      units: '',
      unitPrice: '',
      purchaseDate: '',
      remarks: '',
    },
  })

  // Reset form when dialog opens/closes or holding changes
  useEffect(() => {
    if (open && holding) {
      form.reset({
        categoryId: holding.categoryId,
        name: holding.name,
        symbol: holding.symbol || '',
        subCategory: holding.subCategory || '',
        units: holding.units.toString(),
        unitPrice: holding.unitPrice.toString(),
        purchaseDate: holding.purchaseDate
          ? new Date(holding.purchaseDate).toISOString().split('T')[0]
          : '',
        remarks: holding.remarks || '',
      })
    } else if (open && !holding) {
      form.reset({
        categoryId: '',
        name: '',
        symbol: '',
        subCategory: '',
        units: '',
        unitPrice: '',
        purchaseDate: '',
        remarks: '',
      })
    }
  }, [open, holding, form])

  // Fetch stock price from API
  const fetchStockPrice = async () => {
    const symbol = form.getValues('symbol')
    if (!symbol) {
      toast.error('Please enter a stock symbol first')
      return
    }

    setFetchingPrice(true)
    try {
      const response = await fetch(
        `/api/v1/market/price?symbol=${encodeURIComponent(symbol)}`,
        {
          headers: {
            'x-user-id': 'test-user-001',
          },
        }
      )

      const result = await response.json()

      if (result.success && result.data) {
        form.setValue('unitPrice', result.data.price.toString())

        // Show appropriate message based on currency conversion
        if (result.data.originalCurrency !== 'INR') {
          toast.success(
            `Price fetched: ₹${result.data.price}\n` +
            `(${result.data.originalCurrency} $${result.data.originalPrice} × ${result.data.conversionRate.toFixed(2)} = ₹${result.data.price})`
          )
        } else {
          toast.success(
            `Price fetched: ₹${result.data.price} ` +
            `(${result.data.changePercent >= 0 ? '+' : ''}${result.data.changePercent}%)`
          )
        }
      } else {
        toast.error(result.error?.message || 'Failed to fetch price')
      }
    } catch (error) {
      console.error('Error fetching price:', error)
      toast.error('Failed to fetch stock price')
    } finally {
      setFetchingPrice(false)
    }
  }

  const onSubmit = async (data: HoldingFormData) => {
    const payload = {
      categoryId: data.categoryId,
      name: data.name,
      symbol: data.symbol || null,
      subCategory: data.subCategory || null,
      units: parseFloat(data.units),
      unitPrice: parseFloat(data.unitPrice),
      investedAmount: parseFloat(data.units) * parseFloat(data.unitPrice),
      currentAmount: parseFloat(data.units) * parseFloat(data.unitPrice), // Initially same as invested
      profitLoss: 0,
      purchaseDate: data.purchaseDate || null,
      remarks: data.remarks || null,
    }

    try {
      if (isEditMode) {
        await updateHolding.mutateAsync({ id: holding.id, data: payload })
      } else {
        await addHolding.mutateAsync(payload)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to save holding:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Holding' : 'Add New Holding'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of your holding'
              : 'Add a new investment to your portfolio'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          categories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.displayName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HDFC Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Symbol with Search Combobox and Fetch Button */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Symbol</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <StockSymbolCombobox
                          value={field.value || ''}
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Auto-fetch price when symbol is selected
                            if (value) {
                              setTimeout(() => fetchStockPrice(), 300)
                            }
                          }}
                          placeholder="Search stock..."
                          exchange="ALL"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={fetchStockPrice}
                        disabled={fetchingPrice || !field.value}
                        title="Fetch current price"
                      >
                        {fetchingPrice ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub Category */}
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Large Cap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Units */}
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Price */}
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1500.50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Calculated Invested Amount */}
            {form.watch('units') && form.watch('unitPrice') && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Invested Amount:{' '}
                  <span className="font-semibold text-foreground">
                    ₹
                    {(
                      parseFloat(form.watch('units') || '0') *
                      parseFloat(form.watch('unitPrice') || '0')
                    ).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Purchase Date */}
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addHolding.isPending || updateHolding.isPending
                }
              >
                {addHolding.isPending || updateHolding.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update'
                ) : (
                  'Add Holding'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
