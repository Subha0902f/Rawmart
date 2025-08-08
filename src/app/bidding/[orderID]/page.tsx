"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"

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

const API_BASE_URL = "http://localhost:3001"

export default function BiddingPage() {
  const params = useParams()
  const orderId = params.orderId as string

  // State management
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [newBidAmount, setNewBidAmount] = useState("")
  const [newDeliveryTime, setNewDeliveryTime] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittingBid, setSubmittingBid] = useState(false)
  const [watchedByUsers] = useState(Math.floor(Math.random() * 50) + 20) // Simulated

  // Fetch auction details
  const fetchAuctionDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auction/${orderId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch auction details")
      }
      const data = await response.json()
      setAuctionDetails(data)

      // Calculate time left based on auction duration and creation time
      const createdAt = new Date(data.createdAt).getTime()
      const durationMs = data.auctionDuration * 60 * 60 * 1000 // Convert hours to milliseconds
      const endTime = createdAt + durationMs
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeLeft(remaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch auction")
    }
  }, [orderId])

  // Fetch bids for the auction
  const fetchBids = useCallback(async () => {
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
  }, [orderId])

  // Submit new bid
  const submitBid = async () => {
    if (!newBidAmount || !newDeliveryTime) {
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
          auctionId: Number.parseInt(orderId),
          vendorId: `vendor_${Date.now()}`, // In real app, this would come from auth
          vendorName: "Your Company",
          price: bidAmount,
          deliveryTime: newDeliveryTime,
          description: newDescription || "Standard delivery terms",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit bid")
      }

      const result = await response.json()
      console.log("Bid submitted successfully:", result)

      // Clear form
      setNewBidAmount("")
      setNewDeliveryTime("")
      setNewDescription("")

      // Refresh bids and auction details
      await fetchBids()
      await fetchAuctionDetails()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit bid")
    } finally {
      setSubmittingBid(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAuctionDetails(), fetchBids()])
      setLoading(false)
    }

    if (orderId) {
      loadData()
    }
  }, [orderId, fetchAuctionDetails, fetchBids])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Auto-refresh bids every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBids()
      fetchAuctionDetails()
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchBids, fetchAuctionDetails])

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  // Format timestamp
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
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#059669" }}>Loading Auction...</div>
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
        </div>
      </div>
    )
  }

  const currentLowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.price)) : auctionDetails.startingBid
  const savingsPercentage = Math.round(
    ((auctionDetails.startingBid - currentLowestBid) / auctionDetails.startingBid) * 100,
  )
  const sortedBids = [...bids].sort((a, b) => a.price - b.price)

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
                VendorBid
              </h1>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "-0.25rem" }}>Live Bidding Session</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#059669", fontWeight: "600" }}>
              <span>👁️</span>
              <span>{watchedByUsers} watching</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: auctionDetails.status === "active" ? "#10b981" : "#ef4444",
                fontWeight: "600",
              }}
            >
              <span>{auctionDetails.status === "active" ? "🟢" : "🔴"}</span>
              <span>{auctionDetails.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1rem" }}>
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
                {timeLeft < 1800 ? "🚨 URGENT - Ending Soon!" : "Auction in Progress"}
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
                Total bids received: {auctionDetails.bids}
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
                🔥 Live Bidding ({bids.length} bids)
              </h3>
              <div style={{ fontSize: "0.875rem", color: "#059669", fontWeight: "600" }}>🔄 Auto-refresh: ON</div>
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
                  🎯 Place Your Bid (Must be less than ₹{currentLowestBid})
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
                    placeholder="Additional details (optional)"
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
                    }}
                  >
                    {submittingBid ? "🔄 Submitting..." : "🎯 Submit Bid"}
                  </button>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563", marginTop: "0.5rem" }}>
                  💡 Tip: Lower bids have higher chances of winning
                </div>
              </div>
            )}

            {/* Bids List */}
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {sortedBids.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                  <div>No bids yet. Be the first to bid!</div>
                </div>
              ) : (
                sortedBids.map((bid, index) => (
                  <div
                    key={bid.id}
                    style={{
                      background:
                        index === 0 ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255, 255, 255, 0.8)",
                      color: index === 0 ? "white" : "#111827",
                      padding: "1.5rem",
                      borderRadius: "0.75rem",
                      marginBottom: "1rem",
                      border: index === 0 ? "none" : "2px solid #e5e7eb",
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
                        background: index === 0 ? "rgba(255, 255, 255, 0.2)" : "#10b981",
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

                    {index === 0 && (
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
                        🏆 LEADING BID
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
                          {bid.vendorName}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            fontSize: "0.875rem",
                            opacity: index === 0 ? 0.9 : 0.7,
                          }}
                        >
                          <span>🚚 {bid.deliveryTime}</span>
                          <span
                            style={{
                              background:
                                bid.status === "pending"
                                  ? "#f59e0b"
                                  : bid.status === "accepted"
                                    ? "#10b981"
                                    : "#ef4444",
                              color: "white",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            {bid.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{bid.price}</div>
                        <div style={{ fontSize: "0.75rem", opacity: index === 0 ? 0.8 : 0.6 }}>
                          per {auctionDetails.unit}
                        </div>
                      </div>
                    </div>

                    {bid.description && (
                      <div style={{ fontSize: "0.875rem", opacity: index === 0 ? 0.9 : 0.7, marginBottom: "0.5rem" }}>
                        💬 {bid.description}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.75rem",
                        opacity: index === 0 ? 0.8 : 0.6,
                      }}
                    >
                      <span>🕒 {formatTimestamp(bid.createdAt)}</span>
                      <span>
                        {Math.round(((auctionDetails.startingBid - bid.price) / auctionDetails.startingBid) * 100)}%
                        below starting price
                      </span>
                    </div>
                  </div>
                ))
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
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#059669" }}>{savingsPercentage}%</div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Savings Rate</div>
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
              Current Winner:{" "}
              <span style={{ color: "#10b981" }}>
                {sortedBids.length > 0 ? sortedBids[0].vendorName : "No bids yet"}
              </span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              If auction ends now, total savings: ₹
              {(auctionDetails.startingBid - currentLowestBid) * auctionDetails.quantity}
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => window.location.reload()}
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
              🔄 Refresh Data
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
              🔔 Set Alert for Final 30min
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
