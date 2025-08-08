interface BulkTier {
  min_qty: number
  discount: number
}

interface Supplier {
  id: string
  name: string
  base_prices: Record<string, number>
  bulk_tiers: BulkTier[]
  quality_score: number
  delivery_radius: number
  min_order_qty: number
  location: [number, number]
  reliability_score: number
  avatar?: string
  strategy?: string
}

interface Bid {
  supplier_id: string
  custom_prices: Record<string, number>
  custom_bulk_tiers: BulkTier[]
  timestamp: number
}

interface Order {
  items: Record<string, number>
  vendor_location: [number, number]
}

interface ScoreData {
  final_score: number
  total_cost: number
  final_prices: Record<string, number>
}

interface CostBreakdown {
  final_prices: Record<string, number>
  total_cost: number
}

export class SmartVendorSelectionAlgorithm {
  private suppliers: Supplier[] = []
  private bids: Record<string, Bid> = {}

  addSupplier(supplier: Supplier) {
    // Sort bulk tiers by minimum quantity
    supplier.bulk_tiers = supplier.bulk_tiers.sort((a, b) => a.min_qty - b.min_qty)
    this.suppliers.push(supplier)
  }

  submitBid(supplier_id: string, custom_prices: Record<string, number> = {}, custom_bulk_tiers: BulkTier[] = []) {
    this.bids[supplier_id] = {
      supplier_id,
      custom_prices,
      custom_bulk_tiers,
      timestamp: Date.now(),
    }
  }

  getEffectivePrice(supplier: Supplier, item: string, quantity: number): number | null {
    const bid = this.bids[supplier.id] || {}
    const custom_prices = bid.custom_prices || {}
    const bulk_tiers = bid.custom_bulk_tiers.length > 0 ? bid.custom_bulk_tiers : supplier.bulk_tiers

    const price = custom_prices[item] ?? supplier.base_prices[item]
    if (price === undefined) {
      return null // Supplier doesn't offer this item
    }

    let applicable_discount = 0.0
    for (const tier of bulk_tiers.sort((a, b) => a.min_qty - b.min_qty)) {
      if (quantity >= tier.min_qty) {
        applicable_discount = tier.discount
      }
    }

    return price * (1 - applicable_discount)
  }

  getCostBreakdown(supplier: Supplier, order: Order): CostBreakdown {
    const bid = this.bids[supplier.id] || {}
    const custom_prices = bid.custom_prices || {}
    const custom_bulk_tiers = bid.custom_bulk_tiers.length > 0 ? bid.custom_bulk_tiers : supplier.bulk_tiers

    const prices: Record<string, number> = {}
    let total = 0

    for (const [item, qty] of Object.entries(order.items)) {
      const price = custom_prices[item] ?? supplier.base_prices[item]
      if (price === undefined) {
        continue
      }

      let discount = 0.0
      for (const tier of custom_bulk_tiers.sort((a, b) => a.min_qty - b.min_qty)) {
        if (qty >= tier.min_qty) {
          discount = tier.discount
        }
      }

      const final_price = price * (1 - discount)
      prices[item] = final_price
      total += final_price * qty
    }

    return {
      final_prices: prices,
      total_cost: total,
    }
  }

  private distance(loc1: [number, number], loc2: [number, number]): number {
    return Math.sqrt(Math.pow(loc1[0] - loc2[0], 2) + Math.pow(loc1[1] - loc2[1], 2))
  }

  vendorSelectionScore(supplier: Supplier, order: Order): ScoreData {
    // Skip if supplier can't deliver
    if (this.distance(supplier.location, order.vendor_location) > supplier.delivery_radius) {
      return { final_score: Number.NEGATIVE_INFINITY, total_cost: Number.POSITIVE_INFINITY, final_prices: {} }
    }

    const breakdown = this.getCostBreakdown(supplier, order)
    const total_cost = breakdown.total_cost

    // Score based on cost, quality, distance
    const dist = this.distance(supplier.location, order.vendor_location)
    const score = (1 / (total_cost + 1)) * 0.5 + (supplier.quality_score / 10) * 0.3 + (1 / (dist + 1)) * 0.2

    return {
      final_score: Math.round(score * 10 * 100) / 100,
      total_cost: total_cost,
      final_prices: breakdown.final_prices,
    }
  }

  findOptimalSuppliers(order: Order) {
    const supplier_scores = []

    for (const supplier of this.suppliers) {
      // Check if supplier can fulfill the order and meet min qty
      const total_order_value = Object.entries(order.items).reduce((sum, [item, qty]) => {
        const price = this.getEffectivePrice(supplier, item, qty)
        return price !== null ? sum + price * qty : sum
      }, 0)

      if (total_order_value < supplier.min_order_qty) {
        continue
      }

      // Check if all items are available
      const missing_items = Object.keys(order.items).filter(
        (item) => this.getEffectivePrice(supplier, item, 1) === null,
      )
      if (missing_items.length > 0) {
        continue
      }

      const score_data = this.vendorSelectionScore(supplier, order)

      if (score_data.final_score !== Number.NEGATIVE_INFINITY) {
        supplier_scores.push({
          supplier,
          score_data,
          cost_breakdown: this.getCostBreakdown(supplier, order),
        })
      }
    }

    supplier_scores.sort((a, b) => b.score_data.final_score - a.score_data.final_score)
    return supplier_scores
  }

  getSuppliers(): Supplier[] {
    return [...this.suppliers]
  }

  getBids(): Record<string, Bid> {
    return { ...this.bids }
  }

  clearBids() {
    this.bids = {}
  }
}
