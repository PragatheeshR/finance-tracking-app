'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'

interface PortfolioFiltersProps {
  categories: Array<{ id: string; displayName: string }>
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  category: string
  profitLossFilter: 'all' | 'profit' | 'loss'
  sortBy: 'name' | 'invested' | 'current' | 'pl' | 'return' | 'allocation'
  sortOrder: 'asc' | 'desc'
}

export function PortfolioFilters({ categories, onFilterChange }: PortfolioFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    profitLossFilter: 'all',
    sortBy: 'current',
    sortOrder: 'desc',
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      category: 'all',
      profitLossFilter: 'all',
      sortBy: 'current',
      sortOrder: 'desc',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.profitLossFilter !== 'all'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Name or symbol..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilters({ category: value || undefined })}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* P&L Filter */}
          <div>
            <Label htmlFor="plFilter">Performance</Label>
            <Select
              value={filters.profitLossFilter}
              onValueChange={(value: any) => updateFilters({ profitLossFilter: value })}
            >
              <SelectTrigger id="plFilter" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="profit">In Profit</SelectItem>
                <SelectItem value="loss">In Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger id="sortBy" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="invested">Invested Amount</SelectItem>
                <SelectItem value="current">Current Value</SelectItem>
                <SelectItem value="pl">Profit/Loss</SelectItem>
                <SelectItem value="return">Return %</SelectItem>
                <SelectItem value="allocation">Allocation %</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div>
            <Label htmlFor="sortOrder">Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: any) => updateFilters({ sortOrder: value })}
            >
              <SelectTrigger id="sortOrder" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.search && (
              <Badge variant="secondary">
                Search: {filters.search}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ search: '' })}
                />
              </Badge>
            )}
            {filters.category !== 'all' && (
              <Badge variant="secondary">
                Category:{' '}
                {categories.find((c) => c.id === filters.category)?.displayName}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ category: 'all' })}
                />
              </Badge>
            )}
            {filters.profitLossFilter !== 'all' && (
              <Badge variant="secondary">
                {filters.profitLossFilter === 'profit' ? 'In Profit' : 'In Loss'}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ profitLossFilter: 'all' })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
