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
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Percent,
} from 'lucide-react'
import { useDeleteHolding } from '@/hooks/use-portfolio'
import { HoldingDialog } from './holding-dialog'
import { formatDistanceToNow } from 'date-fns'

interface EnhancedHoldingsTableProps {
  holdings: any[]
}

export function EnhancedHoldingsTable({ holdings }: EnhancedHoldingsTableProps) {
  const [editingHolding, setEditingHolding] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [holdingToDelete, setHoldingToDelete] = useState<any>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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

  const toggleRowExpansion = (holdingId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(holdingId)) {
      newExpanded.delete(holdingId)
    } else {
      newExpanded.add(holdingId)
    }
    setExpandedRows(newExpanded)
  }

  const calculateDaysHeld = (purchaseDate: Date | null) => {
    if (!purchaseDate) return null
    const days = Math.floor(
      (new Date().getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const calculateAnnualizedReturn = (
    profitLossPercentage: number,
    daysHeld: number | null
  ) => {
    if (!daysHeld || daysHeld === 0) return null
    const years = daysHeld / 365
    return ((Math.pow(1 + profitLossPercentage / 100, 1 / years) - 1) * 100).toFixed(2)
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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="text-right min-w-[100px]">Units</TableHead>
              <TableHead className="text-right min-w-[120px]">Avg Price</TableHead>
              <TableHead className="text-right min-w-[130px]">Invested</TableHead>
              <TableHead className="text-right min-w-[130px]">Current Value</TableHead>
              <TableHead className="text-right min-w-[130px]">P&L</TableHead>
              <TableHead className="text-right min-w-[100px]">Return %</TableHead>
              <TableHead className="text-right min-w-[100px]">Allocation</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const profitLoss = parseFloat(holding.profitLoss.toString())
              const profitLossPercentage = holding.profitLossPercentage
              const isProfit = profitLoss >= 0
              const isExpanded = expandedRows.has(holding.id)
              const daysHeld = calculateDaysHeld(holding.purchaseDate)
              const annualizedReturn = calculateAnnualizedReturn(
                profitLossPercentage,
                daysHeld
              )

              return (
                <>
                  <TableRow key={holding.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRowExpansion(holding.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
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
                        {holding.subCategory && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {holding.subCategory}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(holding.units.toString()).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {parseFloat(holding.unitPrice.toString()).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {parseFloat(holding.investedAmount.toString()).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {parseFloat(holding.currentAmount.toString()).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
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
                          ₹
                          {Math.abs(profitLoss).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={isProfit ? 'text-green-600' : 'text-red-600'}
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
                          <DropdownMenuTrigger asChild>
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

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={11} className="bg-muted/50">
                          <div className="p-4 space-y-3">
                            <h4 className="font-semibold text-sm">Additional Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {holding.purchaseDate && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground">Purchase Date</p>
                                    <p className="font-medium">
                                      {new Date(holding.purchaseDate).toLocaleDateString(
                                        'en-IN'
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {daysHeld !== null && (
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground">Days Held</p>
                                    <p className="font-medium">
                                      {daysHeld} days ({(daysHeld / 365).toFixed(1)}{' '}
                                      years)
                                    </p>
                                  </div>
                                </div>
                              )}

                              {annualizedReturn && (
                                <div className="flex items-start gap-2">
                                  <Percent className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground">
                                      Annualized Return
                                    </p>
                                    <p
                                      className={`font-medium ${
                                        parseFloat(annualizedReturn) >= 0
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {annualizedReturn}% p.a.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {holding.lastPriceUpdate && (
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-muted-foreground">
                                      Last Price Update
                                    </p>
                                    <p className="font-medium">
                                      {formatDistanceToNow(
                                        new Date(holding.lastPriceUpdate),
                                        { addSuffix: true }
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {holding.remarks && (
                              <div>
                                <p className="text-muted-foreground text-sm mb-1">
                                  Notes
                                </p>
                                <p className="text-sm bg-background p-2 rounded border">
                                  {holding.remarks}
                                </p>
                              </div>
                            )}

                            {/* Price Change Info */}
                            <div className="bg-background p-3 rounded border">
                              <h5 className="font-medium text-sm mb-2">
                                Price Movement
                              </h5>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">
                                    Purchase Price
                                  </p>
                                  <p className="font-medium">
                                    ₹
                                    {parseFloat(
                                      holding.unitPrice.toString()
                                    ).toLocaleString('en-IN', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    Current Price
                                  </p>
                                  <p className="font-medium">
                                    ₹
                                    {(
                                      parseFloat(holding.currentAmount.toString()) /
                                      parseFloat(holding.units.toString())
                                    ).toLocaleString('en-IN', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Price Change</p>
                                  <p
                                    className={`font-medium ${
                                      isProfit ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    ₹
                                    {(
                                      parseFloat(holding.currentAmount.toString()) /
                                        parseFloat(holding.units.toString()) -
                                      parseFloat(holding.unitPrice.toString())
                                    ).toLocaleString('en-IN', {
                                      minimumFractionDigits: 2,
                                    })}{' '}
                                    ({profitLossPercentage.toFixed(2)}%)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                </>
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
              <span className="font-semibold">{holdingToDelete?.name}</span>? This
              action cannot be undone.
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
