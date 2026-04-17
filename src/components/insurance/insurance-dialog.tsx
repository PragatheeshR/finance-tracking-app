'use client'

import { useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAddInsurance, useUpdateInsurance } from '@/hooks/use-insurance'
import { Loader2 } from 'lucide-react'

const insuranceSchema = z.object({
  policyName: z.string().min(1, 'Policy name is required'),
  policyType: z.enum(['HEALTH', 'LIFE', 'CAR', 'BIKE', 'OTHER'], {
    required_error: 'Policy type is required',
  }),
  policyNumber: z.string().optional(),
  validTill: z.string().optional(),
  premiumAmount: z.string().optional(),
  premiumDueDate: z.string().optional(),
  amountInsured: z.string().optional(),
  nominee: z.string().optional(),
  documentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  remarks: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

type InsuranceFormData = z.infer<typeof insuranceSchema>

interface InsuranceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy?: any
}

const POLICY_TYPES = [
  { value: 'HEALTH', label: '🏥 Health Insurance' },
  { value: 'LIFE', label: '💖 Life Insurance' },
  { value: 'CAR', label: '🚗 Car Insurance' },
  { value: 'BIKE', label: '🏍️ Bike Insurance' },
  { value: 'OTHER', label: '📄 Other Insurance' },
]

export function InsuranceDialog({
  open,
  onOpenChange,
  policy,
}: InsuranceDialogProps) {
  const isEditMode = !!policy
  const addInsurance = useAddInsurance()
  const updateInsurance = useUpdateInsurance()

  const form = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      policyName: '',
      policyType: 'HEALTH',
      policyNumber: '',
      validTill: '',
      premiumAmount: '',
      premiumDueDate: '',
      amountInsured: '',
      nominee: '',
      documentUrl: '',
      remarks: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (open && policy) {
      form.reset({
        policyName: policy.policyName,
        policyType: policy.policyType,
        policyNumber: policy.policyNumber || '',
        validTill: policy.validTill
          ? new Date(policy.validTill).toISOString().split('T')[0]
          : '',
        premiumAmount: policy.premiumAmount?.toString() || '',
        premiumDueDate: policy.premiumDueDate
          ? new Date(policy.premiumDueDate).toISOString().split('T')[0]
          : '',
        amountInsured: policy.amountInsured?.toString() || '',
        nominee: policy.nominee || '',
        documentUrl: policy.documentUrl || '',
        remarks: policy.remarks || '',
        isActive: policy.isActive ?? true,
      })
    } else if (open && !policy) {
      form.reset({
        policyName: '',
        policyType: 'HEALTH',
        policyNumber: '',
        validTill: '',
        premiumAmount: '',
        premiumDueDate: '',
        amountInsured: '',
        nominee: '',
        documentUrl: '',
        remarks: '',
        isActive: true,
      })
    }
  }, [open, policy, form])

  const onSubmit = async (data: InsuranceFormData) => {
    const payload = {
      policyName: data.policyName,
      policyType: data.policyType,
      policyNumber: data.policyNumber || undefined,
      validTill: data.validTill ? new Date(data.validTill).toISOString() : undefined,
      premiumAmount: data.premiumAmount
        ? parseFloat(data.premiumAmount)
        : undefined,
      premiumDueDate: data.premiumDueDate
        ? new Date(data.premiumDueDate).toISOString()
        : undefined,
      amountInsured: data.amountInsured
        ? parseFloat(data.amountInsured)
        : undefined,
      nominee: data.nominee || undefined,
      documentUrl: data.documentUrl || undefined,
      remarks: data.remarks || undefined,
      isActive: data.isActive,
    }

    try {
      if (isEditMode) {
        await updateInsurance.mutateAsync({ id: policy.id, data: payload })
      } else {
        await addInsurance.mutateAsync(payload)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to save policy:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Insurance Policy' : 'Add New Insurance Policy'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of your insurance policy'
              : 'Add a new insurance policy to track'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Policy Name */}
              <FormField
                control={form.control}
                name="policyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Family Health Insurance"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Policy Type */}
              <FormField
                control={form.control}
                name="policyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POLICY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Policy Number */}
              <FormField
                control={form.control}
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., POL123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valid Till */}
              <FormField
                control={form.control}
                name="validTill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Till</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Premium Amount */}
              <FormField
                control={form.control}
                name="premiumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premium Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Premium Due Date */}
              <FormField
                control={form.control}
                name="premiumDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premium Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount Insured */}
              <FormField
                control={form.control}
                name="amountInsured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nominee */}
              <FormField
                control={form.control}
                name="nominee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominee</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document URL */}
            <FormField
              control={form.control}
              name="documentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Document URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/policy-document.pdf"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Link to your policy document (PDF, image, or cloud storage link)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this policy..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Is this policy currently active?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
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
                disabled={addInsurance.isPending || updateInsurance.isPending}
              >
                {addInsurance.isPending || updateInsurance.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update Policy'
                ) : (
                  'Add Policy'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
