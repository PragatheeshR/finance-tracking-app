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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useDeleteIncome } from '@/hooks/use-income'
import { IncomeDialog } from './income-dialog'

interface IncomeTableProps {
  income: any[]
}

const sourceColors: Record<string, string> = {
  SALARY: 'bg-blue-100 text-blue-800',
  BUSINESS: 'bg-purple-100 text-purple-800',
  INVESTMENT: 'bg-green-100 text-green-800',
  FREELANCE: 'bg-orange-100 text-orange-800',
  RENTAL: 'bg-teal-100 text-teal-800',
  GIFT: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const sourceLabels: Record<string, string> = {
  SALARY: '💼 Salary',
  BUSINESS: '🏢 Business',
  INVESTMENT: '📈 Investment',
  FREELANCE: '💻 Freelance',
  RENTAL: '🏠 Rental',
  GIFT: '🎁 Gift',
  OTHER: '📝 Other',
}

export function IncomeTable({ income }: IncomeTableProps) {
  const [editingIncome, setEditingIncome] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [incomeToDelete, setIncomeToDelete] = useState<any>(null)

  const deleteIncome = useDeleteIncome()

  const handleEdit = (income: any) => {
    setEditingIncome(income)
    setDialogOpen(true)
  }

  const handleDelete = (income: any) => {
    setIncomeToDelete(income)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (incomeToDelete) {
      await deleteIncome.mutateAsync(incomeToDelete.id)
      setDeleteDialogOpen(false)
      setIncomeToDelete(null)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingIncome(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (income.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No income records found</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {income.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell className="font-medium">
                  {item.description}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={sourceColors[item.source as keyof typeof sourceColors]}
                  >
                    {sourceLabels[item.source as keyof typeof sourceLabels]}
                  </Badge>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  ₹{parseFloat(item.amount.toString()).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  {item.tags && item.tags.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.slice(0, 2).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <IncomeDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        income={editingIncome}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income: "
              <span className="font-semibold">{incomeToDelete?.description}</span>
              "? This action cannot be undone.
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
