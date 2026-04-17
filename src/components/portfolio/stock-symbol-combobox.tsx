'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface StockSearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
  currency: string
}

interface StockSymbolComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  exchange?: 'ALL' | 'NSE' | 'BSE' | 'NASDAQ'
}

export function StockSymbolCombobox({
  value = '',
  onValueChange,
  placeholder = 'Search stocks...',
  exchange = 'ALL',
}: StockSymbolComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [results, setResults] = React.useState<StockSearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>()

  // Debounced search
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `/api/v1/market/search?query=${encodeURIComponent(searchQuery)}&exchange=${exchange}`,
          {
            headers: {
              'x-user-id': 'test-user-001',
            },
          }
        )

        const data = await response.json()
        if (data.success && data.data?.results) {
          setResults(data.data.results)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 500) // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, exchange])

  const selectedStock = results.find((stock) => stock.symbol === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <span className="truncate">
              {selectedStock ? (
                <>
                  <span className="font-medium">{value}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {selectedStock.name}
                  </span>
                </>
              ) : (
                value
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search stocks..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>
                {searchQuery.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No stocks found'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    value={stock.symbol}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? '' : currentValue)
                      setOpen(false)
                      setSearchQuery('')
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === stock.symbol ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {stock.exchange}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {stock.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
