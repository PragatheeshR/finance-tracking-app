'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Trash2, Eye, Paperclip } from 'lucide-react'
import { useDeleteInsurance } from '@/hooks/use-insurance'
import { InsuranceDialog } from './insurance-dialog'

interface InsuranceTableProps {
  policies: any[]
  onViewDetails?: (policy: any) => void
}

const policyTypeColors: Record<string, string> = {
  HEALTH: 'bg-green-100 text-green-800',
  LIFE: 'bg-blue-100 text-blue-800',
  CAR: 'bg-orange-100 text-orange-800',
  BIKE: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const policyTypeLabels: Record<string, string> = {
  HEALTH: '🏥 Health',
  LIFE: '💖 Life',
  CAR: '🚗 Car',
  BIKE: '🏍️ Bike',
  OTHER: '📄 Other',
}

export function InsuranceTable({ policies, onViewDetails }: InsuranceTableProps) {
  const [editingPolicy, setEditingPolicy] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<any>(null)

  const deletePolicy = useDeleteInsurance()

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy)
    setDialogOpen(true)
  }

  const handleDelete = (policy: any) => {
    setPolicyToDelete(policy)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (policyToDelete) {
      await deletePolicy.mutateAsync(policyToDelete.id)
      setDeleteDialogOpen(false)
      setPolicyToDelete(null)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingPolicy(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDaysUntilExpiry = (validTill: string | null) => {
    if (!validTill) return null
    const today = new Date()
    const expiryDate = new Date(validTill)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Policy Number</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Valid Till</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => {
              const daysUntilExpiry = getDaysUntilExpiry(policy.validTill)
              const isExpiringSoon =
                daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0

              return (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {policy.policyName}
                      {policy.documentUrl && (
                        <Paperclip className="h-3 w-3 text-muted-foreground" title="Document attached" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        policyTypeColors[
                          policy.policyType as keyof typeof policyTypeColors
                        ]
                      }
                    >
                      {
                        policyTypeLabels[
                          policy.policyType as keyof typeof policyTypeLabels
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {policy.policyNumber || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {policy.amountInsured
                      ? `₹${parseFloat(policy.amountInsured).toLocaleString(
                          'en-IN'
                        )}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {policy.premiumAmount
                      ? `₹${parseFloat(policy.premiumAmount).toLocaleString(
                          'en-IN'
                        )}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(policy.validTill)}</span>
                      {isExpiringSoon && (
                        <span className="text-xs text-orange-600">
                          Expires in {daysUntilExpiry} days
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={policy.isActive ? 'default' : 'secondary'}
                    >
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onViewDetails && (
                          <DropdownMenuItem
                            onClick={() => onViewDetails(policy)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(policy)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(policy)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <InsuranceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        policy={editingPolicy}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insurance Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{policyToDelete?.policyName}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
