"use client"

import { useState, useEffect, useCallback } from "react"
import { SmartVendorSelectionAlgorithm } from "../../../lib/vendor-algorithm"
import { BOT_SUPPLIERS, FULL_ITEM_LIST } from "../../../lib/game-data"

interface AuctionDetails {
  orderId: number
  title: string
  category: string
  qualitySpecs: string
  quantity: number
  unit: string
  startingBid: number
  auctionDuration: number
  deliveryLocation: string
  urgent: boolean
  status: string
  bids: number
  currentPrice: number | null
  leadingBid: number | null
  createdAt: string
  description?: string
  deliveryTime?: string
  paymentTerms?: string
  vendor?: string
  vendorRating?: number
  vendorImage?: string
  verified?: boolean
}

// Types for bids and results
interface BotBid {
  supplier_id: string
  supplier_name: string
  custom_prices: Record<string, number>
  custom_bulk_tiers: Array<{ min_qty: number; discount: number }>
  strategy?: string
}

interface UserBid {
  prices: Record<string, number>
  bulkTiers: Array<{ min_qty: number; discount: number }>
}

interface Result {
  supplier: Supplier
  score_data: {
    final_score: number
    total_cost: number
    final_prices: Record<string, number>
  }
  cost_breakdown: {
    final_prices: Record<string, number>
    total_cost: number
  }
}

interface GameState {
  algorithm: SmartVendorSelectionAlgorithm
  currentAuction: AuctionDetails | null
  gamePhase: "setup" | "bidding" | "results"
  timeLeft: number
  userBid: UserBid | null
  botBids: BotBid[]
  results: Result[]
  gameStats: {
    gamesPlayed: number
    gamesWon: number
    totalSavings: number
  }
}

interface Supplier {
  id: string
  name: string
  avatar?: string
  base_prices: Record<string, number>
  bulk_tiers: Array<{ min_qty: number; discount: number }>
  quality_score: number
  delivery_radius: number
  min_order_qty: number
  location: [number, number]
  reliability_score: number
  strategy?: string
}

const API_BASE_URL = "http://localhost:3001"

export default function VendorBiddingGame() {
  const [gameState, setGameState] = useState<GameState>({
    algorithm: new SmartVendorSelectionAlgorithm(),
    currentAuction: null,
    gamePhase: "setup",
    timeLeft: 60,
    userBid: null,
    botBids: [],
    results: [],
    gameStats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalSavings: 0,
    },
  })

  const [auctions, setAuctions] = useState<AuctionDetails[]>([])
  const [auctionsLoading, setAuctionsLoading] = useState(true)
  const [auctionsError, setAuctionsError] = useState<string | null>(null)
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)
  const [customOrder, setCustomOrder] = useState("")
  const [customLocation, setCustomLocation] = useState("10,10")
  const [userBidForm, setUserBidForm] = useState({
    prices: {} as Record<string, string>,
    bulkTiers: [{ min_qty: "", discount: "" }],
  })
  const [notification, setNotification] = useState<string | null>(null)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [rulesAccepted, setRulesAccepted] = useState(false)

  // Fetch auctions from API
  const fetchAuctions = useCallback(async () => {
    try {
      setAuctionsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/auctions`)
      if (!response.ok) {
        throw new Error("Failed to fetch auctions")
      }
      const data = await response.json()
      setAuctions(data)
      setAuctionsError(null)
    } catch (err) {
      setAuctionsError(err instanceof Error ? err.message : "Failed to fetch auctions")
      // Fallback to sample data if API fails
      setAuctions([])
    } finally {
      setAuctionsLoading(false)
    }
  }, [])

  // Convert auction to order format for algorithm
  const convertAuctionToOrder = (auction: AuctionDetails) => {
    // For single item bidding, use the auction title as the item name
    // or map to a single relevant item
    const itemMapping: Record<string, string> = {
      "Fresh Vegetables Supply": "Onions",
      "Dairy Products Bulk Order": "Milk",
      "Grocery Store Restock": "Rice",
      "Restaurant Daily Supplies": "Chicken",
      "Catering Service Order": "Potatoes",
    }

    // Get single item for this auction
    const singleItem = itemMapping[auction.title] || "Item Price"

    const items: Record<string, number> = {
      [singleItem]: auction.quantity,
    }

    // Parse delivery location to coordinates
    let location: [number, number] = [10, 10] // default
    try {
      // Try to extract coordinates from delivery location string
      const coords = auction.deliveryLocation.match(/\d+/g)
      if (coords && coords.length >= 2) {
        location = [Number.parseInt(coords[0]), Number.parseInt(coords[1])]
      }
    } catch {
      // Use default location if parsing fails
    }

    return {
      name: auction.title,
      items: items,
      vendor_location: location,
      auction: auction,
    }
  }

  // Initialize game
  useEffect(() => {
    const algo = new SmartVendorSelectionAlgorithm()

    // Add bot suppliers
    BOT_SUPPLIERS.forEach((supplier: Supplier) => {
      algo.addSupplier(supplier)
    })

    // Add user as a supplier
    algo.addSupplier({
      id: "user",
      name: "Your Company",
      avatar: "👤",
      base_prices: {
        Onions: 25,
        Potatoes: 30,
        Tomatoes: 40,
        Milk: 55,
        Eggs: 6,
        Chicken: 180,
        Rice: 45,
        Dahi: 60,
        Paneer: 300,
        Butter: 450,
        "Green Chilies": 80,
        Ginger: 120,
        Cheese: 400,
        "Various Lentils": 90,
        "Vegetable Oil": 150,
      } as Record<string, number>,
      bulk_tiers: [
        { min_qty: 10, discount: 0.05 },
        { min_qty: 50, discount: 0.1 },
        { min_qty: 100, discount: 0.15 },
      ],
      quality_score: 8.0,
      delivery_radius: 15,
      min_order_qty: 500,
      location: [10, 10],
      reliability_score: 8.0,
      strategy: "user",
    })

    setGameState((prev) => ({ ...prev, algorithm: algo }))

    // Fetch auctions on component mount
    fetchAuctions()
  }, [fetchAuctions])

  // Timer countdown
  useEffect(() => {
    if (gameState.gamePhase !== "bidding" || gameState.timeLeft <= 0) return

    const timer = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeLeft: prev.timeLeft > 0 ? prev.timeLeft - 1 : 0,
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.gamePhase, gameState.timeLeft])

  // Generate bot bids with lowest-wins strategy
  const generateBotBids = useCallback(() => {
    const bots = BOT_SUPPLIERS.map((bot: Supplier) => {
      const strategy = bot.strategy

      // For lowest-wins, bots will try to bid lower than base prices
      const baseReduction = Math.random() * 0.25 + 0.05 // 5-30% reduction

      const customPrices: Record<string, number> = {}
      Object.keys(bot.base_prices).forEach((item) => {
        const basePrice = bot.base_prices[item as keyof typeof bot.base_prices]
        if (basePrice === undefined) return

        let reduction = baseReduction

        // Strategy-specific adjustments for lowest-wins
        if (strategy === "aggressive")
          reduction += 0.1 // More aggressive reduction
        else if (strategy === "conservative")
          reduction -= 0.05 // Less aggressive
        else if (strategy === "sniper")
          reduction += Math.random() * 0.15 // Variable aggressive
        else if (strategy === "reactive") reduction += Math.random() * 0.08
        else if (strategy === "frequent") reduction += Math.random() * 0.06

        // Ensure minimum viable price (not below 60% of base)
        customPrices[item] = Math.max(basePrice * (1 - reduction), basePrice * 0.6)
      })

      const customBulkTiers = bot.bulk_tiers.map((tier: { min_qty: number; discount: number }) => ({
        min_qty: tier.min_qty,
        discount: tier.discount + Math.random() * 0.08, // Better discounts for bulk
      }))

      return {
        supplier_id: bot.id,
        supplier_name: bot.name,
        custom_prices: customPrices,
        custom_bulk_tiers: customBulkTiers,
        strategy: strategy,
      }
    })

    return bots
  }, [])

  // Start new game with selected auction
  const startNewGame = () => {
    if (!rulesAccepted) {
      setShowRulesModal(true)
      return
    }

    let selectedAuction: AuctionDetails | null = null

    if (selectedAuctionId !== null) {
      selectedAuction = auctions.find((a) => a.orderId === selectedAuctionId) || null
    }

    if (!selectedAuction && selectedAuctionId !== 999) {
      alert("Please select a valid auction!")
      return
    }

    let order
    if (selectedAuctionId === 999) {
      // Custom order - also single item
      order = parseCustomOrder()
      if (!order) return
    } else {
      // Convert auction to order format
      order = convertAuctionToOrder(selectedAuction!)
    }

    // Clear previous bids
    gameState.algorithm.clearBids()

    // Generate bot bids with lowest-wins strategy
    const botBids = generateBotBids()

    // Submit bot bids to algorithm
    botBids.forEach((bid: BotBid) => {
      gameState.algorithm.submitBid(bid.supplier_id, bid.custom_prices, bid.custom_bulk_tiers)
    })

    setGameState((prev) => ({
      ...prev,
      currentAuction: selectedAuction,
      gamePhase: "bidding",
      timeLeft: 60,
      botBids: botBids,
      userBid: null,
      results: [],
    }))

    showNotification("🎮 Single-item auction started! Lowest bid wins - compete against AI!")
  }

  // Submit user bid
  const submitUserBid = () => {
    const prices: Record<string, number> = {}
    let hasValidPrices = false

    Object.entries(userBidForm.prices).forEach(([item, priceStr]) => {
      const price = Number.parseFloat(priceStr)
      if (!isNaN(price) && price > 0) {
        prices[item] = price
        hasValidPrices = true
      }
    })

    if (!hasValidPrices) {
      alert("Please enter at least one valid price!")
      return
    }

    const bulkTiers = userBidForm.bulkTiers
      .filter((tier) => tier.min_qty && tier.discount)
      .map((tier: { min_qty: string; discount: string }) => ({
        min_qty: Number.parseInt(tier.min_qty),
        discount: Number.parseFloat(tier.discount),
      }))

    // Submit user bid to algorithm
    gameState.algorithm.submitBid("user", prices, bulkTiers)

    setGameState((prev) => ({
      ...prev,
      userBid: { prices, bulkTiers },
    }))

    showNotification("✅ Your bid submitted successfully!")
  }

  // Parse custom order
  const parseCustomOrder = useCallback(() => {
    if (!customOrder.trim()) return null

    try {
      const items: Record<string, number> = {}
      const pairs = customOrder.split(",")

      for (const pair of pairs) {
        const [item, qty] = pair.split("=").map((s) => s.trim())
        if (!FULL_ITEM_LIST.includes(item)) {
          throw new Error(`Item "${item}" not available`)
        }
        items[item] = Number.parseInt(qty)
      }

      const [x, y] = customLocation.split(",").map((n) => Number.parseInt(n.trim()))

      return {
        name: "Custom Order",
        items,
        vendor_location: [x, y] as [number, number], // Change from 'location' to 'vendor_location'
        auction: null,
      }
    } catch (error) {
      alert(`Invalid order format: ${error}`)
      return null
    }
  }, [customOrder, customLocation, FULL_ITEM_LIST])

  // End bidding phase and calculate results
  const endBiddingPhase = useCallback(() => {
    const currentOrder =
      selectedAuctionId === 999
        ? parseCustomOrder()
        : gameState.currentAuction
          ? convertAuctionToOrder(gameState.currentAuction)
          : null

    if (!currentOrder) return

    const results = gameState.algorithm.findOptimalSuppliers(currentOrder)

    const userWon = results.length > 0 && results[0].supplier.id === "user"
    const savings =
      results.length > 0 ? (gameState.currentAuction?.startingBid || 1000) - results[0].score_data.total_cost : 0

    setGameState((prev) => ({
      ...prev,
      gamePhase: "results",
      results: results,
      gameStats: {
        gamesPlayed: prev.gameStats.gamesPlayed + 1,
        gamesWon: prev.gameStats.gamesWon + (userWon ? 1 : 0),
        totalSavings: prev.gameStats.totalSavings + (userWon ? savings : 0),
      },
    }))

    if (userWon) {
      showNotification("🏆 Congratulations! You won the bid! Contact Your Vendor: 98765 43210")
    } else {
      showNotification("😔 You didn't win this time. Try a more competitive bid!")
    }
  }, [gameState.currentAuction, selectedAuctionId, parseCustomOrder, gameState.algorithm])

  // Auto-end bidding when timer reaches 0
  useEffect(() => {
    if (gameState.gamePhase === "bidding" && gameState.timeLeft === 0) {
      endBiddingPhase()
    }
  }, [gameState.timeLeft, gameState.gamePhase, endBiddingPhase])

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // Update user bid form
  const updateUserPrice = (item: string, price: string) => {
    setUserBidForm((prev) => ({
      ...prev,
      prices: { ...prev.prices, [item]: price },
    }))
  }

  const updateBulkTier = (index: number, field: "min_qty" | "discount", value: string) => {
    setUserBidForm((prev) => ({
      ...prev,
      bulkTiers: prev.bulkTiers.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)),
    }))
  }

  const addBulkTier = () => {
    setUserBidForm((prev) => ({
      ...prev,
      bulkTiers: [...prev.bulkTiers, { min_qty: "", discount: "" }],
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const calculateTimeLeft = (createdAt: string, duration: number) => {
    const created = new Date(createdAt).getTime()
    const durationMs = duration * 60 * 60 * 1000
    const endTime = created + durationMs
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000))

    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
          padding: "1rem 0",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              🎯
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                }}
              >
                Vendor Bidding Game
              </h1>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "-0.25rem" }}>
                Real Auctions • Smart Algorithm Competition
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#10b981" }}>
                {gameState.gameStats.gamesPlayed}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Games</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#10b981" }}>
                {gameState.gameStats.gamesWon}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Wins</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#10b981" }}>
                {Math.round((gameState.gameStats.gamesWon / Math.max(gameState.gameStats.gamesPlayed, 1)) * 100)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Win Rate</div>
            </div>
          </div>
        </div>

        {/* Notification Bar */}
        {notification && (
          <div
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "white",
              padding: "0.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: "600",
              animation: "slideDown 0.3s ease-out",
            }}
          >
            {notification}
          </div>
        )}
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Rules Modal */}
        {showRulesModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflowY: "auto",
                margin: "1rem",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
                <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                  Auction Bidding Rules
                </h2>
              </div>

              <div style={{ fontSize: "1rem", lineHeight: "1.6", color: "#374151", marginBottom: "2rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#059669", marginBottom: "0.5rem" }}>
                    🏆 How to Win:
                  </h3>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    • <strong>LOWEST BID WINS</strong> - The supplier with the lowest total cost gets the contract
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    • Algorithm considers price, quality score, delivery distance, and bulk discounts
                  </p>
                  <p style={{ margin: "0" }}>• You compete against 5 AI bots with different bidding strategies</p>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#059669", marginBottom: "0.5rem" }}>
                    📦 Auction Format:
                  </h3>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    • <strong>Single Item Bidding</strong> - Each auction is for ONE specific item only
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    • Real auction data from live database with actual quantities and requirements
                  </p>
                  <p style={{ margin: "0" }}>• 60-second bidding window to submit your competitive prices</p>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#059669", marginBottom: "0.5rem" }}>
                    💰 Bidding Strategy:
                  </h3>
                  <p style={{ margin: "0 0 0.5rem 0" }}>• Set competitive per-unit prices for the auction item</p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    • Configure bulk discount tiers to improve your algorithm score
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>• Balance low prices with quality and delivery capabilities</p>
                  <p style={{ margin: "0" }}>• AI bots will analyze and counter your strategy in real-time</p>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ef4444", marginBottom: "0.5rem" }}>
                    ⚠️ Important Notes:
                  </h3>
                  <p style={{ margin: "0 0 0.5rem 0" }}>• Bids cannot be changed once submitted</p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>• Algorithm scoring is final and transparent</p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>• Game tracks your win rate and total savings achieved</p>
                  <p style={{ margin: "0" }}>• Each auction uses real market data and requirements</p>
                </div>

                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "2px solid #10b981",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#059669" }}>
                    🎮 Ready to compete against AI algorithms and win real auction contracts?
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button
                  onClick={() => setShowRulesModal(false)}
                  style={{
                    background: "#e5e7eb",
                    color: "#374151",
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setRulesAccepted(true)
                    setShowRulesModal(false)
                  }}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  ✅ Accept & Start Playing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Setup Phase */}
        {gameState.gamePhase === "setup" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              borderRadius: "1rem",
              padding: "2rem",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              🎮 Select Live Auction to Bid On
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              {/* Auction Selection */}
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
                  📋 Live Auctions from Database
                </h3>

                {auctionsLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
                    <div>Loading live auctions...</div>
                  </div>
                ) : auctionsError ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
                    <div>{auctionsError}</div>
                    <button
                      onClick={fetchAuctions}
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        marginTop: "1rem",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : auctions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📝</div>
                    <div>No live auctions available</div>
                  </div>
                ) : (
                  auctions.map((auction) => (
                    <div
                      key={auction.orderId}
                      onClick={() => setSelectedAuctionId(auction.orderId)}
                      style={{
                        background:
                          selectedAuctionId === auction.orderId
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(255, 255, 255, 0.8)",
                        border: selectedAuctionId === auction.orderId ? "2px solid #10b981" : "2px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                        marginBottom: "1rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                    >
                      {/* Live indicator */}
                      {auction.status === "active" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "white",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          🔴 LIVE
                        </div>
                      )}

                      <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 0.5rem 0" }}>
                        {auction.title}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span
                          style={{
                            background: "#10b981",
                            color: "white",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          {auction.category}
                        </span>
                        {auction.urgent && (
                          <span
                            style={{
                              background: "#ef4444",
                              color: "white",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            URGENT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        📦 Single Item: {(() => {
                          const itemMapping: Record<string, string> = {
                            "Fresh Vegetables Supply": "Onions",
                            "Dairy Products Bulk Order": "Milk",
                            "Grocery Store Restock": "Rice",
                            "Restaurant Daily Supplies": "Chicken",
                            "Catering Service Order": "Potatoes",
                          }
                          return itemMapping[auction.title] || "Onions"
                        })()} • Quantity: {auction.quantity} {auction.unit}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        📍 {auction.deliveryLocation}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        ⏰ {calculateTimeLeft(auction.createdAt, auction.auctionDuration)} left • {auction.bids} bids
                      </div>
                    </div>
                  ))
                )}

                {/* Custom Order */}
                <div
                  onClick={() => setSelectedAuctionId(999)}
                  style={{
                    background: selectedAuctionId === 999 ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.8)",
                    border: selectedAuctionId === 999 ? "2px solid #10b981" : "2px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 0.5rem 0" }}>
                    🎯 Custom Order (Test Mode)
                  </h4>
                  {selectedAuctionId === 999 && (
                    <div style={{ marginTop: "1rem" }}>
                      <input
                        type="text"
                        value={customOrder}
                        onChange={(e) => setCustomOrder(e.target.value)}
                        placeholder="e.g., Onions=50,Milk=30,Eggs=100"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #10b981",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="Location: x,y (e.g., 10,10)"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #10b981",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bot Suppliers Info */}
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
                  🤖 Your AI Competitors
                </h3>

                {BOT_SUPPLIERS.map((bot: Supplier, index: number) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      padding: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.5rem" }}>{bot.avatar}</span>
                      <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>{bot.name}</h4>
                      <span
                        style={{
                          background: "#10b981",
                          color: "white",
                          padding: "0.125rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {bot.strategy}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      Quality: {bot.quality_score}/10 • Radius: {bot.delivery_radius}km • Min Order: ₹
                      {bot.min_order_qty}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={startNewGame}
                disabled={selectedAuctionId === null}
                style={{
                  background: selectedAuctionId === null ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  padding: "1rem 2rem",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  cursor: selectedAuctionId === null ? "not-allowed" : "pointer",
                  boxShadow: selectedAuctionId === null ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                🚀 Start Bidding on Selected Auction
              </button>
            </div>
          </div>
        )}

        {/* Bidding Phase */}
        {gameState.gamePhase === "bidding" && gameState.currentAuction && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Auction Details & Timer */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(4px)",
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              {/* Timer */}
              <div
                style={{
                  background:
                    gameState.timeLeft < 20
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                  ⏰ {formatTime(gameState.timeLeft)}
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                  {gameState.timeLeft < 20 ? "🚨 FINAL MOMENTS!" : "Bidding Time Remaining"}
                </div>
              </div>

              {/* Auction Details */}
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", marginBottom: "1rem" }}>
                📋 Live Auction: {gameState.currentAuction.title}
              </h3>

              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                    }}
                  >
                    {gameState.currentAuction.category}
                  </span>
                  {gameState.currentAuction.urgent && (
                    <span
                      style={{
                        background: "#ef4444",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      URGENT
                    </span>
                  )}
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                    }}
                  >
                    🔴 LIVE
                  </span>
                </div>

                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#059669", marginBottom: "1rem" }}>
                  Auction Requirements:
                </h4>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#111827" }}>Total Quantity</span>
                    <span style={{ fontWeight: "600", color: "#059669" }}>
                      {gameState.currentAuction.quantity} {gameState.currentAuction.unit}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#111827" }}>Starting Bid</span>
                    <span style={{ fontWeight: "600", color: "#059669" }}>₹{gameState.currentAuction.startingBid}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#111827" }}>Current Bids</span>
                    <span style={{ fontWeight: "600", color: "#059669" }}>
                      {gameState.currentAuction.bids} received
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  📍 Delivery: {gameState.currentAuction.deliveryLocation}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  📝 {gameState.currentAuction.description || "Premium quality requirements"}
                </div>
              </div>

              {/* Bot Activity */}
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  border: "2px dashed #ef4444",
                }}
              >
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#ef4444", marginBottom: "0.5rem" }}>
                  🤖 Bot Activity
                </h4>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  {gameState.botBids.length} AI competitors have analyzed this auction and submitted optimized bids
                  using advanced pricing algorithms!
                </div>
              </div>
            </div>

            {/* User Bidding Panel */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(4px)",
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", marginBottom: "1rem" }}>
                🎯 Your Competitive Bid
              </h3>

              {/* Price Inputs */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#059669", marginBottom: "1rem" }}>
                  💰 Custom Prices (₹ per unit)
                </h4>
                {/* Show items based on auction conversion */}
                {(() => {
                  const order = convertAuctionToOrder(gameState.currentAuction)
                  return Object.keys(order.items).map((item) => (
                    <div
                      key={item}
                      style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}
                    >
                      <label style={{ minWidth: "120px", fontSize: "0.875rem", color: "#111827" }}>{item}:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={userBidForm.prices[item] || ""}
                        onChange={(e) => updateUserPrice(item, e.target.value)}
                        placeholder="Enter price"
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          border: "2px solid #10b981",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", minWidth: "60px" }}>
                        Qty: {order.items[item]}
                      </span>
                    </div>
                  ))
                })()}
              </div>

              {/* Bulk Tiers */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#059669", marginBottom: "1rem" }}>
                  📊 Bulk Discount Tiers
                </h4>
                {userBidForm.bulkTiers.map((tier, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <input
                      type="number"
                      value={tier.min_qty}
                      onChange={(e) => updateBulkTier(index, "min_qty", e.target.value)}
                      placeholder="Min Qty"
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "2px solid #10b981",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={tier.discount}
                      onChange={(e) => updateBulkTier(index, "discount", e.target.value)}
                      placeholder="Discount (0.05 = 5%)"
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "2px solid #10b981",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={addBulkTier}
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#059669",
                    padding: "0.5rem 1rem",
                    border: "2px dashed #10b981",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  + Add Bulk Tier
                </button>
              </div>

              {/* Submit Bid */}
              <div style={{ textAlign: "center" }}>
                {!gameState.userBid ? (
                  <button
                    onClick={submitUserBid}
                    disabled={gameState.timeLeft === 0}
                    style={{
                      background: gameState.timeLeft === 0 ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      padding: "1rem 2rem",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      cursor: gameState.timeLeft === 0 ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    🚀 Submit Your Bid
                  </button>
                ) : (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#059669",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    ✅ Your bid has been submitted!
                  </div>
                )}
              </div>

              {gameState.timeLeft === 0 && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    onClick={endBiddingPhase}
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white",
                      padding: "1rem 2rem",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    🏁 End Bidding & See Results
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Phase */}
        {gameState.gamePhase === "results" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              borderRadius: "1rem",
              padding: "2rem",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              🏆 Auction Results
            </h2>

            {gameState.results.length > 0 ? (
              <div>
                {/* Winner Announcement */}
                <div
                  style={{
                    background:
                      gameState.results[0].supplier.id === "user"
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                    padding: "2rem",
                    borderRadius: "1rem",
                    marginBottom: "2rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {gameState.results[0].supplier.id === "user" ? "🏆" : "😔"}
                  </div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>
                    {gameState.results[0].supplier.id === "user"
                      ? "🎉 CONGRATULATIONS! YOU WON THE AUCTION!"
                      : `${gameState.results[0].supplier.name} Won This Auction`}
                  </h3>
                  <div style={{ fontSize: "1rem", opacity: 0.9 }}>
                    Winning Cost: ₹{gameState.results[0].score_data.total_cost.toFixed(2)} • Algorithm Score:
                    {gameState.results[0].score_data.final_score}
                  </div>
                  {gameState.currentAuction && (
                    <div style={{ fontSize: "0.875rem", opacity: 0.8, marginTop: "0.5rem" }}>
                      Original Auction: {gameState.currentAuction.title} • Starting Bid: ₹
                      {gameState.currentAuction.startingBid}
                    </div>
                  )}
                </div>

                {/* Detailed Results */}
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", marginBottom: "1rem" }}>
                  📊 All Bids Ranked by Smart Algorithm
                </h3>

                {gameState.results.map((result, index) => {
                  const isUser = result.supplier.id === "user"
                  const isWinner = index === 0

                  return (
                    <div
                      key={result.supplier.id}
                      style={{
                        background: isWinner
                          ? isUser
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "linear-gradient(135deg, #ef4444, #dc2626)"
                          : isUser
                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                            : "rgba(255, 255, 255, 0.8)",
                        color: isWinner || isUser ? "white" : "#111827",
                        padding: "1.5rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1rem",
                        border: isWinner || isUser ? "none" : "2px solid #e5e7eb",
                        position: "relative",
                      }}
                    >
                      {/* Rank Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-0.5rem",
                          left: "1rem",
                          background: isWinner || isUser ? "rgba(255, 255, 255, 0.2)" : "#10b981",
                          color: "white",
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.875rem",
                          fontWeight: "700",
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Winner Badge */}
                      {isWinner && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          🏆 AUCTION WINNER
                        </div>
                      )}

                      {/* User Badge */}
                      {isUser && !isWinner && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          👤 YOU
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: "1.125rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>
                            {isUser ? "🎯 Your Company" : `${result.supplier.avatar || "🤖"} ${result.supplier.name}`}
                          </h4>
                          <div style={{ fontSize: "0.875rem", opacity: isWinner || isUser ? 0.9 : 0.7 }}>
                            Quality: {result.supplier.quality_score}/10 • Algorithm Score:
                            {result.score_data.final_score}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                            ₹{result.score_data.total_cost.toFixed(2)}
                          </div>
                          <div style={{ fontSize: "0.75rem", opacity: isWinner || isUser ? 0.8 : 0.6 }}>Total Cost</div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div style={{ fontSize: "0.875rem", opacity: isWinner || isUser ? 0.9 : 0.7 }}>
                        <strong>Price Breakdown:</strong>
                        <div style={{ marginTop: "0.5rem" }}>
                          {Object.entries(result.score_data.final_prices).map(([item, price]) => (
                            <span key={item} style={{ marginRight: "1rem" }}>
                              {item}: ₹{(price as number).toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
                <div>No valid bids received for this auction.</div>
              </div>
            )}

            {/* Play Again */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button
                onClick={() => {
                  setGameState((prev) => ({ ...prev, gamePhase: "setup" }))
                  fetchAuctions() // Refresh auctions list
                }}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  padding: "1rem 2rem",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                🎮 Bid on Another Auction
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
