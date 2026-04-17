import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api-response'

/**
 * GET /api/v1/market/price?symbol=NSE:HDFCBANK
 * Fetch current stock price for a given symbol
 * Automatically converts foreign currency to INR
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return errorResponse('Symbol is required', 'VALIDATION_ERROR', 400)
    }

    // Parse the symbol format (NSE:HDFCBANK -> HDFCBANK.NS for Yahoo Finance)
    const yahooSymbol = convertToYahooSymbol(symbol)
    const [exchange] = symbol.includes(':') ? symbol.split(':') : ['', symbol]

    // Fetch from Yahoo Finance API
    const priceData = await fetchStockPrice(yahooSymbol)

    if (!priceData) {
      return errorResponse('Failed to fetch stock price', 'EXTERNAL_API_ERROR', 500)
    }

    let finalPrice = priceData.price
    let finalCurrency = priceData.currency
    let conversionRate = 1

    // Convert to INR if currency is not INR
    if (priceData.currency !== 'INR') {
      const exchangeRate = await getExchangeRate(priceData.currency, 'INR')
      if (exchangeRate) {
        conversionRate = exchangeRate
        finalPrice = parseFloat((priceData.price * exchangeRate).toFixed(2))
        finalCurrency = 'INR'
      }
    }

    return successResponse(
      {
        symbol: symbol,
        yahooSymbol: yahooSymbol,
        price: finalPrice,
        originalPrice: priceData.price,
        originalCurrency: priceData.currency,
        currency: finalCurrency,
        conversionRate: conversionRate,
        change: priceData.change,
        changePercent: priceData.changePercent,
        lastUpdated: new Date().toISOString(),
      },
      'Stock price fetched successfully'
    )
  } catch (error) {
    console.error('Error fetching stock price:', error)
    return errorResponse(
      'Failed to fetch stock price',
      'INTERNAL_ERROR',
      500
    )
  }
}

/**
 * Convert symbol formats to Yahoo Finance format
 * Examples:
 * - NSE:HDFCBANK -> HDFCBANK.NS
 * - BSE:500325 -> 500325.BO
 * - NASDAQ:AAPL -> AAPL
 * - NYSE:GOOGL -> GOOGL
 */
function convertToYahooSymbol(symbol: string): string {
  const [exchange, ticker] = symbol.includes(':')
    ? symbol.split(':')
    : ['', symbol]

  switch (exchange?.toUpperCase()) {
    case 'NSE':
      return `${ticker}.NS`
    case 'BSE':
      return `${ticker}.BO`
    case 'NASDAQ':
    case 'NYSE':
    case '':
      return ticker
    default:
      return ticker
  }
}

/**
 * Fetch stock price from Yahoo Finance API
 * Using the public query1 API
 */
async function fetchStockPrice(yahooSymbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Yahoo Finance API error:', response.status)
      return null
    }

    const data = await response.json()

    if (!data?.chart?.result?.[0]) {
      console.error('Invalid Yahoo Finance response')
      return null
    }

    const result = data.chart.result[0]
    const quote = result.indicators.quote[0]
    const meta = result.meta

    const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1]
    const previousClose = meta.previousClose || quote.close[0]

    if (!currentPrice) {
      return null
    }

    const change = currentPrice - previousClose
    const changePercent = ((change / previousClose) * 100)

    return {
      price: parseFloat(currentPrice.toFixed(2)),
      currency: meta.currency || 'INR',
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
    }
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error)
    return null
  }
}

/**
 * Get exchange rate from one currency to another
 * Uses Yahoo Finance currency conversion
 */
async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
  try {
    // Yahoo Finance uses format like USDINR=X for USD to INR
    const currencyPair = `${fromCurrency}${toCurrency}=X`
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${currencyPair}?interval=1d&range=1d`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Exchange rate API error:', response.status)
      return null
    }

    const data = await response.json()

    if (!data?.chart?.result?.[0]) {
      console.error('Invalid exchange rate response')
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta
    const rate = meta.regularMarketPrice

    if (!rate) {
      return null
    }

    return parseFloat(rate.toFixed(4))
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return null
  }
}
