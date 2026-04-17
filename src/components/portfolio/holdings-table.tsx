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
import { Button } from '@/components/ui/button'
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
import { MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useDeleteHolding } from '@/hooks/use-portfolio'
import { HoldingDialog } from './holding-dialog'

interface HoldingsTableProps {
  holdings: any[]
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [editingHolding, setEditingHolding] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [holdingToDelete, setHoldingToDelete] = useState<any>(null)

  const deleteHolding = useDeleteHolding()

  const handleEdit = (holding: any) => {
    setEditingHolding(holding)
    setDialogOpen(true)
  }

  const handleDelete = (holding: any) => {
    setHoldingToDelete(holding)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (holdingToDelete) {
      await deleteHolding.mutateAsync(holdingToDelete.id)
      setDeleteDialogOpen(false)
      setHoldingToDelete(null)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingHolding(null)
    }
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No holdings found</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Invested</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">Return %</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const profitLoss = parseFloat(holding.profitLoss.toString())
              const profitLossPercentage = holding.profitLossPercentage
              const isProfit = profitLoss >= 0

              return (
                <TableRow key={holding.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{holding.name}</div>
                      {holding.symbol && (
                        <div className="text-xs text-muted-foreground">
                          {holding.symbol}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {holding.category.displayName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {parseFloat(holding.units.toString()).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{parseFloat(holding.unitPrice.toString()).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{parseFloat(holding.investedAmount.toString()).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{parseFloat(holding.currentAmount.toString()).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-end ${
                        isProfit ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isProfit ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      ₹{Math.abs(profitLoss).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        isProfit ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {profitLossPercentage >= 0 ? '+' : ''}
                      {profitLossPercentage.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {parseFloat(holding.allocationPct.toString()).toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(holding)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(holding)}
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
      <HoldingDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        holding={editingHolding}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{holdingToDelete?.name}</span>?
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
