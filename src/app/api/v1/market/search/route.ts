import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api-response'

/**
 * GET /api/v1/market/search?query=hdfc&exchange=NSE
 * Search for stock symbols by company name
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const exchange = searchParams.get('exchange') || 'ALL'

    if (!query || query.length < 2) {
      return errorResponse('Query must be at least 2 characters', 'VALIDATION_ERROR', 400)
    }

    // Search using Yahoo Finance API
    const results = await searchStocks(query, exchange)

    return successResponse(
      {
        query,
        exchange,
        results,
      },
      'Stock search completed successfully'
    )
  } catch (error) {
    console.error('Error searching stocks:', error)
    return errorResponse(
      'Failed to search stocks',
      'INTERNAL_ERROR',
      500
    )
  }
}

interface StockSearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
  currency: string
}

/**
 * Search for stocks using Yahoo Finance search API
 */
async function searchStocks(query: string, exchangeFilter: string): Promise<StockSearchResult[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0&enableFuzzyQuery=false`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Yahoo Finance search API error:', response.status)
      return []
    }

    const data = await response.json()

    if (!data?.quotes) {
      return []
    }

    // Filter and format results
    const results: StockSearchResult[] = data.quotes
      .filter((quote: any) => {
        // Filter by type (only stocks/ETFs)
        const validTypes = ['EQUITY', 'ETF']
        if (!validTypes.includes(quote.quoteType)) {
          return false
        }

        // Filter by exchange if specified
        if (exchangeFilter !== 'ALL') {
          const symbol = quote.symbol || ''

          if (exchangeFilter === 'NSE' && !symbol.endsWith('.NS')) {
            return false
          }
          if (exchangeFilter === 'BSE' && !symbol.endsWith('.BO')) {
            return false
          }
          if (exchangeFilter === 'NASDAQ' && (symbol.includes('.') || symbol.length > 5)) {
            return false
          }
        }

        return true
      })
      .map((quote: any) => {
        const symbol = quote.symbol || ''
        let displaySymbol = symbol
        let exchange = quote.exchange || 'UNKNOWN'

        // Format symbol for display
        if (symbol.endsWith('.NS')) {
          displaySymbol = `NSE:${symbol.replace('.NS', '')}`
          exchange = 'NSE'
        } else if (symbol.endsWith('.BO')) {
          displaySymbol = `BSE:${symbol.replace('.BO', '')}`
          exchange = 'BSE'
        } else if (quote.exchange === 'NMS' || quote.exchange === 'NAS') {
          displaySymbol = `NASDAQ:${symbol}`
          exchange = 'NASDAQ'
        } else if (quote.exchange === 'NYQ' || quote.exchange === 'NYSE') {
          displaySymbol = `NYSE:${symbol}`
          exchange = 'NYSE'
        }

        return {
          symbol: displaySymbol,
          name: quote.longname || quote.shortname || quote.symbol,
          exchange: exchange,
          type: quote.quoteType,
          currency: quote.currency || 'USD',
        }
      })
      .slice(0, 10) // Limit to top 10 results

    return results
  } catch (error) {
    console.error('Error in searchStocks:', error)
    return []
  }
}
