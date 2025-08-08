"use client"

import { useState, useEffect, useCallback } from "react"

interface Bid {
  id: number
  auctionId: number
  vendorId: string
  vendorName: string
  price: number
  deliveryTime: string
  description: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  isBot?: boolean
  avatar?: string
  location?: string
  rating?: number
}

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

// Bot users data
const BOT_USERS = [
  {
    id: "bot_1",
    name: "Mumbai Fresh Supplies",
    avatar: "🏪",
    location: "Andheri, Mumbai",
    rating: 4.8,
    strategy: "aggressive", // bids quickly and often
    minDelay: 3000,
    maxDelay: 8000,
  },
  {
    id: "bot_2",
    name: "Wholesale Kings",
    avatar: "👑",
    location: "Dadar, Mumbai",
    rating: 4.6,
    strategy: "conservative", // waits and bids strategically
    minDelay: 8000,
    maxDelay: 15000,
  },
  {
    id: "bot_3",
    name: "Quick Delivery Co",
    avatar: "🚚",
    location: "Bandra, Mumbai",
    rating: 4.7,
    strategy: "reactive", // responds to user bids
    minDelay: 2000,
    maxDelay: 6000,
  },
  {
    id: "bot_4",
    name: "Premium Vendors Ltd",
    avatar: "⭐",
    location: "Powai, Mumbai",
    rating: 4.9,
    strategy: "sniper", // bids in final moments
    minDelay: 5000,
    maxDelay: 12000,
  },
  {
    id: "bot_5",
    name: "Local Market Hub",
    avatar: "🏬",
    location: "Thane, Mumbai",
    rating: 4.4,
    strategy: "frequent", // bids frequently with small decrements
    minDelay: 4000,
    maxDelay: 9000,
  },
]

const DELIVERY_TIMES = [
  "Same day delivery",
  "Next day delivery",
  "Within 2 hours",
  "Express delivery",
  "Standard delivery",
  "Morning delivery",
  "Evening delivery",
]

const DESCRIPTIONS = [
  "Premium quality guaranteed",
  "Fresh stock available",
  "Bulk discount included",
  "Fast delivery service",
  "Quality certified products",
  "Best price in market",
  "Reliable supplier",
  "Express handling",
]

// Helper function to safely handle status values
const getStatusDisplay = (status: string | null | undefined): string => {
  if (!status) return "UNKNOWN"
  return status.toString().toUpperCase()
}

const getStatusColor = (status: string | null | undefined): string => {
  const statusStr = (status || "").toString().toLowerCase()
  switch (statusStr) {
    case "active":
      return "#10b981"
    case "pending":
      return "#f59e0b"
    case "accepted":
      return "#10b981"
    case "rejected":
      return "#ef4444"
    case "stopped":
      return "#6b7280"
    default:
      return "#6b7280"
  }
}

const isStatusActive = (status: string | null | undefined): boolean => {
  return (status || "").toString().toLowerCase() === "active"
}

const API_BASE_URL = "http://localhost:3001"

export default function BiddingPlatform() {
  // Navigation state
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)

  // Auction list state
  const [auctions, setAuctions] = useState<AuctionDetails[]>([])
  const [auctionsLoading, setAuctionsLoading] = useState(true)
  const [auctionsError, setAuctionsError] = useState<string | null>(null)

  // Individual auction state
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [newBidAmount, setNewBidAmount] = useState("")
  const [newDeliveryTime, setNewDeliveryTime] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittingBid, setSubmittingBid] = useState(false)
  const [watchedByUsers] = useState(Math.floor(Math.random() * 50) + 20)

  // Bot bidding state
  const [botBiddingActive, setBotBiddingActive] = useState(false)
  const [activeBots, setActiveBots] = useState<Set<string>>(new Set())
  const [recentBidNotification, setRecentBidNotification] = useState<string | null>(null)
  const [biddingIntensity, setBiddingIntensity] = useState<"low" | "medium" | "high">("medium")

  // Fetch all auctions for list view
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
    } finally {
      setAuctionsLoading(false)
    }
  }, [])

  // Fetch specific auction details
  const fetchAuctionDetails = useCallback(async (orderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auction/${orderId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch auction details")
      }
      const data = await response.json()
      setAuctionDetails(data)

      // Calculate time left based on auction duration and creation time
      const createdAt = new Date(data.createdAt).getTime()
      const durationMs = data.auctionDuration * 60 * 60 * 1000
      const endTime = createdAt + durationMs
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeLeft(remaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch auction")
    }
  }, [])

  // Fetch bids for specific auction
  const fetchBids = useCallback(async (orderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auction-bids/${orderId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch bids")
      }
      const data = await response.json()
      setBids(data)
    } catch (err) {
      console.error("Error fetching bids:", err)
    }
  }, [])

  // Generate bot bid
  const generateBotBid = useCallback(
    (currentLowestBid: number, bot: (typeof BOT_USERS)[0]) => {
      const reductionPercentage = Math.random() * 0.15 + 0.02 // 2-17% reduction
      const newBidPrice = Math.max(
        Math.floor(currentLowestBid * (1 - reductionPercentage)),
        Math.floor(currentLowestBid - Math.random() * 5 - 1), // At least 1-6 rupees less
      )

      return {
        id: Date.now() + Math.random(),
        auctionId: selectedAuctionId!,
        vendorId: bot.id,
        vendorName: bot.name,
        price: newBidPrice,
        deliveryTime: DELIVERY_TIMES[Math.floor(Math.random() * DELIVERY_TIMES.length)],
        description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        isBot: true,
        avatar: bot.avatar,
        location: bot.location,
        rating: bot.rating,
      }
    },
    [selectedAuctionId],
  )

  // Submit bot bid to server
  const submitBotBid = useCallback(
    async (botBid: Bid) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/submit-bid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auctionId: botBid.auctionId,
            vendorId: botBid.vendorId,
            vendorName: botBid.vendorName,
            price: botBid.price,
            deliveryTime: botBid.deliveryTime,
            description: botBid.description,
          }),
        })

        if (response.ok) {
          // Show notification
          setRecentBidNotification(`${botBid.vendorName} bid ₹${botBid.price}!`)
          setTimeout(() => setRecentBidNotification(null), 3000)

          // Refresh data
          await fetchBids(selectedAuctionId!)
          await fetchAuctionDetails(selectedAuctionId!)
        }
      } catch (err) {
        console.error("Bot bid failed:", err)
      }
    },
    [selectedAuctionId, fetchBids, fetchAuctionDetails],
  )

  // Bot bidding logic
  const startBotBidding = useCallback(() => {
    if (!selectedAuctionId || !auctionDetails || botBiddingActive) return

    setBotBiddingActive(true)

    // Determine bidding intensity based on time left
    const intensity = timeLeft < 1800 ? "high" : timeLeft < 3600 ? "medium" : "low"
    setBiddingIntensity(intensity)

    // Select random bots to participate
    const participatingBots = BOT_USERS.filter(() => Math.random() > 0.3) // 70% chance each bot participates
    setActiveBots(new Set(participatingBots.map((bot) => bot.id)))

    participatingBots.forEach((bot) => {
      const scheduleNextBid = () => {
        if (!botBiddingActive || timeLeft <= 0) return

        let delay = Math.random() * (bot.maxDelay - bot.minDelay) + bot.minDelay

        // Adjust delay based on strategy and time pressure
        if (intensity === "high") delay *= 0.5
        else if (intensity === "medium") delay *= 0.8

        // Strategy-specific adjustments
        if (bot.strategy === "aggressive") delay *= 0.7
        else if (bot.strategy === "sniper" && timeLeft > 300) delay *= 2
        else if (bot.strategy === "reactive") delay *= 0.6

        setTimeout(() => {
          if (!botBiddingActive || timeLeft <= 0) return

          const currentLowest = bids.length > 0 ? Math.min(...bids.map((b) => b.price)) : auctionDetails.startingBid

          // Bot decision logic
          const shouldBid = (() => {
            if (bot.strategy === "aggressive") return Math.random() > 0.2
            if (bot.strategy === "conservative") return Math.random() > 0.6
            if (bot.strategy === "reactive") return Math.random() > 0.4
            if (bot.strategy === "sniper") return timeLeft < 300 ? Math.random() > 0.1 : Math.random() > 0.8
            if (bot.strategy === "frequent") return Math.random() > 0.3
            return Math.random() > 0.5
          })()

          if (shouldBid && currentLowest > 10) {
            // Don't bid if price is too low
            const botBid = generateBotBid(currentLowest, bot)
            submitBotBid(botBid)
          }

          // Schedule next bid
          scheduleNextBid()
        }, delay)
      }

      // Start bidding for this bot
      scheduleNextBid()
    })
  }, [selectedAuctionId, auctionDetails, botBiddingActive, timeLeft, bids, generateBotBid, submitBotBid])

  // Handle auction selection
  const selectAuction = async (orderId: number) => {
    setSelectedAuctionId(orderId)
    setLoading(true)
    setError(null)
    setBotBiddingActive(false)

    await Promise.all([fetchAuctionDetails(orderId), fetchBids(orderId)])

    setLoading(false)
  }

  // Go back to auction list
  const goBackToList = () => {
    setBotBiddingActive(false)
    setSelectedAuctionId(null)
    setAuctionDetails(null)
    setBids([])
    setError(null)
    setActiveBots(new Set())
    fetchAuctions()
  }

  // Submit user bid
  const submitBid = async () => {
    if (!newBidAmount || !newDeliveryTime || !selectedAuctionId) {
      alert("Please fill in bid amount and delivery time!")
      return
    }

    const bidAmount = Number.parseFloat(newBidAmount)
    const currentLowest = bids.length > 0 ? Math.min(...bids.map((b) => b.price)) : auctionDetails?.startingBid || 0

    if (bidAmount >= currentLowest) {
      alert("Your bid must be lower than the current lowest bid!")
      return
    }

    setSubmittingBid(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionId: selectedAuctionId,
          vendorId: "user_live",
          vendorName: "You (Live User)",
          price: bidAmount,
          deliveryTime: newDeliveryTime,
          description: newDescription || "Live user bid",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit bid")
      }

      // Clear form
      setNewBidAmount("")
      setNewDeliveryTime("")
      setNewDescription("")

      // Show success notification
      setRecentBidNotification("Your bid submitted successfully! 🎯")
      setTimeout(() => setRecentBidNotification(null), 3000)

      // Refresh data
      await fetchBids(selectedAuctionId)
      await fetchAuctionDetails(selectedAuctionId)

      // Trigger more aggressive bot responses
      setBiddingIntensity("high")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit bid")
    } finally {
      setSubmittingBid(false)
    }
  }

  // Load auctions on component mount
  useEffect(() => {
    fetchAuctions()
  }, [fetchAuctions])

  // Start bot bidding when auction is selected
  useEffect(() => {
    if (selectedAuctionId && auctionDetails && timeLeft > 0 && !botBiddingActive) {
      // Start bot bidding after a short delay
      const timer = setTimeout(() => {
        startBotBidding()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [selectedAuctionId, auctionDetails, timeLeft, startBotBidding, botBiddingActive])

  // Timer countdown for selected auction
  useEffect(() => {
    if (!selectedAuctionId || timeLeft <= 0) {
      setBotBiddingActive(false)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev > 0 ? prev - 1 : 0
        if (newTime === 0) {
          setBotBiddingActive(false)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedAuctionId, timeLeft])

  // Auto-refresh for selected auction
  useEffect(() => {
    if (!selectedAuctionId) return

    const interval = setInterval(() => {
      fetchBids(selectedAuctionId)
      fetchAuctionDetails(selectedAuctionId)
    }, 5000) // More frequent updates for live feel

    return () => clearInterval(interval)
  }, [selectedAuctionId, fetchBids, fetchAuctionDetails])

  // Utility functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const bidTime = new Date(timestamp)
    const diffMs = now.getTime() - bidTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} mins ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
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

  // Common header component
  const Header = ({ showBackButton = false }: { showBackButton?: boolean }) => (
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
              VendorBid
            </h1>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "-0.25rem" }}>
              {selectedAuctionId ? "🔥 LIVE Bidding Battle" : "Auction Platform"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {selectedAuctionId && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#059669", fontWeight: "600" }}
              >
                <span>👁️</span>
                <span>{watchedByUsers} watching</span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f59e0b", fontWeight: "600" }}
              >
                <span>🤖</span>
                <span>{activeBots.size} bots active</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color:
                    biddingIntensity === "high" ? "#ef4444" : biddingIntensity === "medium" ? "#f59e0b" : "#10b981",
                  fontWeight: "600",
                }}
              >
                <span>{biddingIntensity === "high" ? "🔥" : biddingIntensity === "medium" ? "⚡" : "📈"}</span>
                <span>{biddingIntensity.toUpperCase()} INTENSITY</span>
              </div>
            </>
          )}
          {selectedAuctionId && auctionDetails && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: getStatusColor(auctionDetails.status),
                fontWeight: "600",
              }}
            >
              <span>{isStatusActive(auctionDetails.status) ? "🟢" : "🔴"}</span>
              <span>{getStatusDisplay(auctionDetails.status)}</span>
            </div>
          )}
          {showBackButton && (
            <button
              onClick={goBackToList}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                padding: "0.5rem 1.5rem",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              ← Back to Auctions
            </button>
          )}
        </div>
      </div>

      {/* Notification Bar */}
      {recentBidNotification && (
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
          🚨 {recentBidNotification}
        </div>
      )}
    </header>
  )

  // Render auction list view
  if (!selectedAuctionId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Header />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #10b981, #059669)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: "0 0 1rem 0",
              }}
            >
              🔥 Live Bidding Arena
            </h2>
            <p style={{ fontSize: "1.25rem", color: "#6b7280" }}>Compete against real vendors in live auctions!</p>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                padding: "1rem",
                borderRadius: "0.75rem",
                marginTop: "1rem",
                display: "inline-block",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "#059669", fontWeight: "600" }}>
                🤖 AI-powered competitors • 🎯 Real-time bidding • 🏆 Win the best deals
              </span>
            </div>
          </div>

          {auctionsLoading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔄</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#059669" }}>Loading Auctions...</div>
            </div>
          ) : auctionsError ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#ef4444" }}>{auctionsError}</div>
              <button
                onClick={fetchAuctions}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "2rem" }}>
              {auctions.map((auction) => (
                <div
                  key={auction.orderId}
                  onClick={() => selectAuction(auction.orderId)}
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "1rem",
                    padding: "2rem",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  {/* Live indicator */}
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    🔴 LIVE
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: "0 0 0.5rem 0" }}>
                        {auction.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span
                          style={{
                            background: "#10b981",
                            color: "white",
                            padding: "0.25rem 0.5rem",
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
                            background: getStatusColor(auction.status),
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          {getStatusDisplay(auction.status)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                        ₹{auction.currentPrice || auction.startingBid}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>per {auction.unit}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.25rem" }}>
                      📦 Quantity: {auction.quantity} {auction.unit}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      🎯 {auction.bids} bids • 🤖 {Math.floor(Math.random() * 3) + 2} AI competitors
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.875rem", color: "#059669", fontWeight: "600" }}>
                        ⏰ {calculateTimeLeft(auction.createdAt, auction.auctionDuration)} left
                      </div>
                    </div>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      🔥 Join Battle →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {auctions.length === 0 && !auctionsLoading && !auctionsError && (
            <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>No active auctions</div>
              <div>Check back later for new bidding opportunities</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render individual auction bidding view
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔄</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#059669" }}>Entering Bidding Arena...</div>
          <div style={{ fontSize: "1rem", color: "#6b7280", marginTop: "0.5rem" }}>Preparing AI competitors...</div>
        </div>
      </div>
    )
  }

  if (error || !auctionDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#ef4444" }}>{error || "Auction not found"}</div>
          <button
            onClick={goBackToList}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            ← Back to Auctions
          </button>
        </div>
      </div>
    )
  }

  const currentLowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.price)) : auctionDetails.startingBid
  const savingsPercentage = Math.round(
    ((auctionDetails.startingBid - currentLowestBid) / auctionDetails.startingBid) * 100,
  )
  const sortedBids = [...bids].sort((a, b) => a.price - b.price)
  const userBid = sortedBids.find((bid) => bid.vendorId === "user_live")
  const userRank = userBid ? sortedBids.findIndex((bid) => bid.id === userBid.id) + 1 : null

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Header showBackButton={true} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* User Status Bar */}
        {userBid && (
          <div
            style={{
              background:
                userRank === 1
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "white",
              padding: "1rem",
              borderRadius: "0.75rem",
              marginBottom: "2rem",
              textAlign: "center",
              animation: "pulse 2s infinite",
            }}
          >
            <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              {userRank === 1 ? "🏆 YOU'RE WINNING!" : `🎯 You're ranked #${userRank}`}
            </div>
            <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
              Your bid: ₹{userBid.price} •{" "}
              {userRank === 1 ? "Keep defending your position!" : "Bid lower to take the lead!"}
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: typeof window !== "undefined" && window.innerWidth >= 1024 ? "1fr 1fr" : "1fr",
            gap: "2rem",
          }}
        >
          {/* Left Section - Auction Details */}
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
            {/* Timer and Status */}
            <div
              style={{
                background:
                  timeLeft < 1800
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                ⏰ {formatTime(timeLeft)} remaining
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                {timeLeft < 1800 ? "🚨 FINAL SPRINT - Bots are aggressive!" : "🔥 Battle in Progress"}
              </div>
            </div>

            {/* Auction Info */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "3rem" }}>{auctionDetails.vendorImage || "🏪"}</div>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem 0" }}>
                    {auctionDetails.vendor || "Vendor"}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#059669",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span>⭐ {auctionDetails.vendorRating || 4.5}</span>
                    {auctionDetails.verified && (
                      <span
                        style={{
                          background: "#10b981",
                          color: "white",
                          padding: "0.125rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                        }}
                      >
                        ✅ VERIFIED
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>📍 {auctionDetails.deliveryLocation}</div>
                </div>
              </div>
            </div>

            {/* Auction Details */}
            <div style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🎯 Auction Details
                {auctionDetails.urgent && (
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
              </h3>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "0.75rem" }}>
                  {auctionDetails.title}
                </h4>
                <p style={{ color: "#4b5563", marginBottom: "1rem", lineHeight: "1.6" }}>
                  {auctionDetails.description || "Premium quality requirements for daily operations."}
                </p>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}
                >
                  <div>
                    <strong style={{ color: "#059669" }}>📦 Quantity:</strong>
                    <div>
                      {auctionDetails.quantity} {auctionDetails.unit}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: "#059669" }}>🚚 Delivery:</strong>
                    <div>{auctionDetails.deliveryLocation}</div>
                  </div>
                  <div>
                    <strong style={{ color: "#059669" }}>⏰ Category:</strong>
                    <div>{auctionDetails.category}</div>
                  </div>
                  <div>
                    <strong style={{ color: "#059669" }}>✅ Quality:</strong>
                    <div>{auctionDetails.qualitySpecs || "Premium quality"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Current Lowest Bid</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>₹{currentLowestBid}</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                per {auctionDetails.unit} • {savingsPercentage}% below starting price
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.5rem" }}>
                Total bids: {auctionDetails.bids} • Active competitors: {activeBots.size + (userBid ? 1 : 0)}
              </div>
            </div>
          </div>

          {/* Right Section - Live Bidding */}
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
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                🔥 Live Battle ({bids.length} bids)
              </h3>
              <div style={{ fontSize: "0.875rem", color: "#059669", fontWeight: "600" }}>
                🤖 Bots: {biddingIntensity.toUpperCase()}
              </div>
            </div>

            {/* Place New Bid */}
            {auctionDetails.status === "active" && timeLeft > 0 && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  marginBottom: "2rem",
                  border: "2px dashed #10b981",
                }}
              >
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#059669", marginBottom: "1rem" }}>
                  🎯 Your Bid (Beat ₹{currentLowestBid})
                </h4>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#059669",
                          fontWeight: "600",
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        value={newBidAmount}
                        onChange={(e) => setNewBidAmount(e.target.value)}
                        placeholder={`Less than ${currentLowestBid}`}
                        style={{
                          width: "100%",
                          padding: "0.75rem 0.75rem 0.75rem 2rem",
                          border: "2px solid #10b981",
                          borderRadius: "0.5rem",
                          fontSize: "1rem",
                          fontWeight: "600",
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={newDeliveryTime}
                      onChange={(e) => setNewDeliveryTime(e.target.value)}
                      placeholder="Delivery time"
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        border: "2px solid #10b981",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                      }}
                    />
                  </div>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Your competitive edge (optional)"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #10b981",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      resize: "vertical",
                    }}
                  />
                  <button
                    onClick={submitBid}
                    disabled={submittingBid}
                    style={{
                      background: submittingBid ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: "600",
                      cursor: submittingBid ? "not-allowed" : "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    {submittingBid ? "🔄 Submitting..." : "🚀 SUBMIT BID"}
                  </button>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563", marginTop: "0.5rem" }}>
                  ⚡ Warning: Bots will respond to your bid within seconds!
                </div>
              </div>
            )}

            {/* Bids List */}
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {sortedBids.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
                  <div>Battle starting... Be the first to bid!</div>
                </div>
              ) : (
                sortedBids.map((bid, index) => {
                  const isUser = bid.vendorId === "user_live"
                  const isLeading = index === 0

                  return (
                    <div
                      key={bid.id}
                      style={{
                        background: isLeading
                          ? isUser
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "linear-gradient(135deg, #ef4444, #dc2626)"
                          : isUser
                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                            : "rgba(255, 255, 255, 0.8)",
                        color: isLeading || isUser ? "white" : "#111827",
                        padding: "1.5rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1rem",
                        border: isLeading || isUser ? "none" : "2px solid #e5e7eb",
                        position: "relative",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Rank Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-0.5rem",
                          left: "1rem",
                          background: isLeading || isUser ? "rgba(255, 255, 255, 0.2)" : "#10b981",
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

                      {/* Special badges */}
                      {isLeading && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {isUser ? "🏆 YOU'RE WINNING!" : "🤖 BOT LEADING"}
                        </div>
                      )}

                      {isUser && !isLeading && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          👤 YOUR BID
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
                          <h4 style={{ fontSize: "1.125rem", fontWeight: "700", margin: "0 0 0.25rem 0" }}>
                            {isUser ? "🎯 YOU" : `${bid.avatar || "🤖"} ${bid.vendorName}`}
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              fontSize: "0.875rem",
                              opacity: isLeading || isUser ? 0.9 : 0.7,
                            }}
                          >
                            <span>🚚 {bid.deliveryTime}</span>
                            {bid.isBot && (
                              <span
                                style={{
                                  background: "rgba(255, 255, 255, 0.2)",
                                  padding: "0.125rem 0.5rem",
                                  borderRadius: "0.25rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                🤖 BOT
                              </span>
                            )}
                            {bid.location && <span>📍 {bid.location}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{bid.price}</div>
                          <div style={{ fontSize: "0.75rem", opacity: isLeading || isUser ? 0.8 : 0.6 }}>
                            per {auctionDetails.unit}
                          </div>
                        </div>
                      </div>

                      {bid.description && (
                        <div
                          style={{
                            fontSize: "0.875rem",
                            opacity: isLeading || isUser ? 0.9 : 0.7,
                            marginBottom: "0.5rem",
                          }}
                        >
                          💬 {bid.description}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.75rem",
                          opacity: isLeading || isUser ? 0.8 : 0.6,
                        }}
                      >
                        <span>🕒 {formatTimestamp(bid.createdAt)}</span>
                        <span>
                          {Math.round(((auctionDetails.startingBid - bid.price) / auctionDetails.startingBid) * 100)}%
                          below starting
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Bidding Stats */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#059669" }}>
                  ₹{auctionDetails.startingBid - currentLowestBid}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Total Savings</div>
              </div>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#059669" }}>{bids.length}</div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Total Bids</div>
              </div>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#059669" }}>{userRank || "N/A"}</div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Your Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "1rem",
            padding: "1.5rem",
            marginTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827" }}>
              Current Leader:{" "}
              <span
                style={{
                  color: sortedBids.length > 0 && sortedBids[0].vendorId === "user_live" ? "#10b981" : "#ef4444",
                }}
              >
                {sortedBids.length > 0
                  ? sortedBids[0].vendorId === "user_live"
                    ? "🏆 YOU!"
                    : `🤖 ${sortedBids[0].vendorName}`
                  : "No bids yet"}
              </span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Total potential savings: ₹{(auctionDetails.startingBid - currentLowestBid) * auctionDetails.quantity}
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => {
                fetchBids(selectedAuctionId)
                fetchAuctionDetails(selectedAuctionId)
              }}
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "#059669",
                padding: "0.75rem 1.5rem",
                border: "2px solid #10b981",
                borderRadius: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔄 Refresh Battle
            </button>
            <button
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔔 Alert Me at Final 5min
            </button>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
