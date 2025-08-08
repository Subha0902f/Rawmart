"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  Package,
  Gavel,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  MapPin,
  Truck,
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  Target,
  Loader2,
} from "lucide-react"

// Type definitions
interface Auction {
  id: string
  title: string
  category: string
  description: string
  quantity: number
  unit: string
  budget: number
  deadline: string
  location: string
  status: "active" | "closed" | "assigned"
  bidsCount: number
  createdAt: string
  createdBy: string
  currentHighestBid?: number
}

interface WholesalerBid {
  id: string
  auctionId: string
  auctionTitle: string
  bidAmount: number
  deliveryTime: string
  description: string
  submittedAt: string
  status: "pending" | "accepted" | "rejected" | "outbid"
  isHighestBid: boolean
  competitorBids: number
  auctionBudget: number
  auctionDeadline: string
}

interface BidHistory {
  id: string
  auctionTitle: string
  bidAmount: number
  finalStatus: "won" | "lost" | "expired"
  submittedAt: string
  completedAt: string
  auctionBudget: number
  winningBid?: number
}

interface ApiAuction {
  orderId: number
  title: string
  category: string
  qualitySpecs: string
  quantity: number
  unit: string
  startingBid: number
  currentPrice: number | null
  leadingBid: number | null
  auctionDuration: string
  deliveryLocation: string
  status: string
  bids: number
  createdAt: string
  urgent: boolean
}

interface ApiBid {
  id: number
  auctionId: number
  vendorId: string
  vendorName: string
  price: number
  deliveryTime: string
  description: string
  status: string
  createdAt: string
}

const WholesalePanel = () => {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"current-bids" | "available-auctions" | "bid-history">("current-bids")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User ID - in a real app, this would come from authentication context
  const [currentUserId] = useState("user123") // You can make this dynamic based on your auth system

  // Dynamic data states
  const [availableAuctions, setAvailableAuctions] = useState<Auction[]>([])
  const [currentBids, setCurrentBids] = useState<WholesalerBid[]>([])
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([])
  const [submittingBid, setSubmittingBid] = useState(false)
  const [newBid, setNewBid] = useState({
    price: 0,
    deliveryTime: "",
    description: "",
  })

  const categories = [
    { id: "electronics", name: "Electronics", itemCount: 0 },
    { id: "furniture", name: "Furniture", itemCount: 0 },
    { id: "machinery", name: "Machinery", itemCount: 0 },
    { id: "supplies", name: "Office Supplies", itemCount: 0 },
    { id: "services", name: "Services", itemCount: 0 },
    { id: "materials", name: "Raw Materials", itemCount: 0 },
  ]

  // API base URL - adjust this to match your server
  const API_BASE_URL = "http://localhost:3001/api"

  // Dummy data for current bids
  const dummyCurrentBids = useMemo(() => [
    {
      id: "bid-001",
      auctionId: "auction-101",
      auctionTitle: "Industrial Grade Steel Pipes - 500 Units",
      bidAmount: 45000,
      deliveryTime: "10-12 business days",
      description: "Premium quality steel pipes with ISO certification. Includes delivery and installation support.",
      submittedAt: "2024-01-15T10:30:00Z",
      status: "pending" as const,
      isHighestBid: true,
      competitorBids: 8,
      auctionBudget: 50000,
      auctionDeadline: "2024-01-25",
    },
    {
      id: "bid-002",
      auctionId: "auction-102",
      auctionTitle: "Commercial Kitchen Equipment Set",
      bidAmount: 28500,
      deliveryTime: "7-10 business days",
      description:
        "Complete kitchen setup including ovens, refrigeration units, and prep stations. 2-year warranty included.",
      submittedAt: "2024-01-14T14:20:00Z",
      status: "outbid" as const,
      isHighestBid: false,
      competitorBids: 12,
      auctionBudget: 35000,
      auctionDeadline: "2024-01-22",
    },
    {
      id: "bid-003",
      auctionId: "auction-103",
      auctionTitle: "Office Furniture Package - 200 Desks & Chairs",
      bidAmount: 15750,
      deliveryTime: "5-7 business days",
      description: "Ergonomic office furniture with modern design. Bulk pricing with assembly service included.",
      submittedAt: "2024-01-13T09:15:00Z",
      status: "accepted" as const,
      isHighestBid: true,
      competitorBids: 6,
      auctionBudget: 18000,
      auctionDeadline: "2024-01-20",
    },
    {
      id: "bid-004",
      auctionId: "auction-104",
      auctionTitle: "Medical Equipment - Diagnostic Machines",
      bidAmount: 125000,
      deliveryTime: "15-20 business days",
      description: "State-of-the-art diagnostic equipment with training and maintenance package for first year.",
      submittedAt: "2024-01-12T16:45:00Z",
      status: "pending" as const,
      isHighestBid: false,
      competitorBids: 4,
      auctionBudget: 150000,
      auctionDeadline: "2024-01-28",
    },
    {
      id: "bid-005",
      auctionId: "auction-105",
      auctionTitle: "Construction Materials - Cement & Aggregates",
      bidAmount: 32000,
      deliveryTime: "3-5 business days",
      description:
        "High-grade construction materials with timely delivery to construction site. Bulk discount applied.",
      submittedAt: "2024-01-11T11:30:00Z",
      status: "rejected" as const,
      isHighestBid: false,
      competitorBids: 15,
      auctionBudget: 40000,
      auctionDeadline: "2024-01-18",
    },
    {
      id: "bid-006",
      auctionId: "auction-106",
      auctionTitle: "IT Hardware - Servers & Networking Equipment",
      bidAmount: 85000,
      deliveryTime: "12-15 business days",
      description:
        "Enterprise-grade servers with networking equipment. Includes setup, configuration, and 3-year support.",
      submittedAt: "2024-01-10T13:20:00Z",
      status: "pending" as const,
      isHighestBid: true,
      competitorBids: 7,
      auctionBudget: 95000,
      auctionDeadline: "2024-01-26",
    },
  ], [])

  // Dummy data for bid history
  const dummyBidHistory = useMemo(() => [
    {
      id: "history-001",
      auctionTitle: "Warehouse Automation System",
      bidAmount: 75000,
      finalStatus: "won" as const,
      submittedAt: "2023-12-20T10:00:00Z",
      completedAt: "2023-12-28T15:30:00Z",
      auctionBudget: 80000,
      winningBid: 75000,
    },
    {
      id: "history-002",
      auctionTitle: "Fleet Management Software License",
      bidAmount: 25000,
      finalStatus: "lost" as const,
      submittedAt: "2023-12-18T14:15:00Z",
      completedAt: "2023-12-25T12:00:00Z",
      auctionBudget: 30000,
      winningBid: 22500,
    },
    {
      id: "history-003",
      auctionTitle: "Industrial Cleaning Equipment",
      bidAmount: 18500,
      finalStatus: "won" as const,
      submittedAt: "2023-12-15T09:30:00Z",
      completedAt: "2023-12-22T16:45:00Z",
      auctionBudget: 20000,
      winningBid: 18500,
    },
    {
      id: "history-004",
      auctionTitle: "Security Camera System - 50 Units",
      bidAmount: 42000,
      finalStatus: "lost" as const,
      submittedAt: "2023-12-12T11:20:00Z",
      completedAt: "2023-12-19T14:30:00Z",
      auctionBudget: 45000,
      winningBid: 38500,
    },
    {
      id: "history-005",
      auctionTitle: "Laboratory Equipment Package",
      bidAmount: 95000,
      finalStatus: "expired" as const,
      submittedAt: "2023-12-10T16:00:00Z",
      completedAt: "2023-12-17T23:59:00Z",
      auctionBudget: 100000,
    },
    {
      id: "history-006",
      auctionTitle: "Textile Manufacturing Machinery",
      bidAmount: 150000,
      finalStatus: "won" as const,
      submittedAt: "2023-12-08T08:45:00Z",
      completedAt: "2023-12-15T17:20:00Z",
      auctionBudget: 180000,
      winningBid: 150000,
    },
    {
      id: "history-007",
      auctionTitle: "Solar Panel Installation - 1000 Units",
      bidAmount: 220000,
      finalStatus: "lost" as const,
      submittedAt: "2023-12-05T13:10:00Z",
      completedAt: "2023-12-12T10:15:00Z",
      auctionBudget: 250000,
      winningBid: 195000,
    },
    {
      id: "history-008",
      auctionTitle: "Food Processing Equipment",
      bidAmount: 65000,
      finalStatus: "won" as const,
      submittedAt: "2023-12-03T15:25:00Z",
      completedAt: "2023-12-10T11:40:00Z",
      auctionBudget: 70000,
      winningBid: 65000,
    },
    {
      id: "history-009",
      auctionTitle: "HVAC System - Commercial Building",
      bidAmount: 88000,
      finalStatus: "lost" as const,
      submittedAt: "2023-12-01T12:30:00Z",
      completedAt: "2023-12-08T16:00:00Z",
      auctionBudget: 95000,
      winningBid: 82000,
    },
    {
      id: "history-010",
      auctionTitle: "Packaging Machinery - Automated Line",
      bidAmount: 135000,
      finalStatus: "expired" as const,
      submittedAt: "2023-11-28T10:15:00Z",
      completedAt: "2023-12-05T23:59:00Z",
      auctionBudget: 160000,
    },
  ], [])

  // Helper function to convert API auction to UI auction format
  const convertApiAuctionToUiAuction = useCallback((apiAuction: ApiAuction): Auction => {
    // Better date handling
    let deadline = "No deadline"
    try {
      if (apiAuction.createdAt) {
        const date = new Date(apiAuction.createdAt)
        deadline = date.toISOString().split("T")[0]
      }
    } catch (dateError) {
      console.error("Date conversion error:", dateError)
    }

    return {
      id: apiAuction.orderId.toString(),
      title: apiAuction.title || "Untitled Auction",
      category: apiAuction.category || "general",
      description: apiAuction.qualitySpecs || "No description provided",
      quantity: apiAuction.quantity || 1,
      unit: apiAuction.unit || "items",
      budget: apiAuction.startingBid || 0,
      deadline: deadline,
      location: apiAuction.deliveryLocation || "Location not specified",
      status: "active", // Force all to active for now to see the data
      bidsCount: apiAuction.bids || 0,
      createdAt: apiAuction.createdAt || new Date().toISOString(),
      createdBy: "System",
      currentHighestBid: apiAuction.currentPrice || undefined,
    }
  }, [])

  // Helper function to fetch bids for a specific auction
  const fetchAuctionBids = useCallback(async (auctionId: string): Promise<ApiBid[]> => {
    try {
      console.log("Fetching bids for auction:", auctionId)
      const response = await fetch(`${API_BASE_URL}/auction-bids/${auctionId}`)
      if (!response.ok) {
        console.log(`No bids found for auction ${auctionId} or endpoint error:`, response.status)
        return []
      }
      const bids: ApiBid[] = await response.json()
      console.log(`Found ${bids.length} bids for auction ${auctionId}`)
      return bids
    } catch (err) {
      console.error(`Error fetching bids for auction ${auctionId}:`, err)
      return []
    }
  }, [API_BASE_URL])

  // Fetch available auctions
  const fetchAvailableAuctions = useCallback(async () => {
    try {
      console.log("Fetching auctions from:", `${API_BASE_URL}/auctions`)
      const response = await fetch(`${API_BASE_URL}/auctions`)
      if (!response.ok) {
        throw new Error(`Failed to fetch auctions: ${response.status} ${response.statusText}`)
      }
      const apiAuctions: ApiAuction[] = await response.json()
      console.log("Raw API auctions:", apiAuctions)

      // Don't filter by status initially - let's see all auctions
      const allAuctions = apiAuctions.filter((auction) => auction.title) // Just filter out any invalid entries
      console.log("Filtered auctions:", allAuctions)

      // Fetch bids for each auction and update auction data
      const auctionsWithBids = await Promise.all(
        allAuctions.map(async (apiAuction) => {
          try {
            const bids = await fetchAuctionBids(apiAuction.orderId.toString())
            console.log(`Bids for auction ${apiAuction.orderId}:`, bids)

            // Calculate highest bid from actual bids
            const highestBid = bids.length > 0 ? Math.max(...bids.map((bid) => bid.price)) : null

            // Update auction with real bid data
            const updatedApiAuction = {
              ...apiAuction,
              bids: bids.length,
              currentPrice: highestBid,
            }

            const convertedAuction = convertApiAuctionToUiAuction(updatedApiAuction)
            console.log("Converted auction:", convertedAuction)
            return convertedAuction
          } catch (bidError) {
            console.error(`Error processing auction ${apiAuction.orderId}:`, bidError)
            // Return auction without bid data if bid fetching fails
            return convertApiAuctionToUiAuction(apiAuction)
          }
        }),
      )

      console.log("Final auctions with bids:", auctionsWithBids)
      setAvailableAuctions(auctionsWithBids)
    } catch (err) {
      console.error("Error fetching auctions:", err)
      setError(`Failed to load auctions: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }, [API_BASE_URL, fetchAuctionBids, convertApiAuctionToUiAuction])

  // Fetch user's current bids
  const fetchCurrentBids = useCallback(async () => {
    try {
      // For demo purposes, we'll use the dummy data
      // In a real app, this would fetch from your API
      console.log("Loading current bids...")
      setCurrentBids(dummyCurrentBids)
    } catch (err) {
      console.error("Error fetching current bids:", err)
      setCurrentBids([])
    }
  }, [dummyCurrentBids])

  // Fetch bid history
  const fetchBidHistory = useCallback(async () => {
    try {
      // For demo purposes, we'll use the dummy data
      // In a real app, this would fetch from your API
      console.log("Loading bid history...")
      setBidHistory(dummyBidHistory)
    } catch (err) {
      console.error("Error fetching bid history:", err)
      setBidHistory([])
    }
  }, [dummyBidHistory])

  // Submit a new bid
  const handleSubmitBid = async () => {
    if (!selectedAuction || !newBid.price || !newBid.deliveryTime) {
      setError("Please fill in all required fields")
      return
    }

    setSubmittingBid(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/submit-bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionId: Number.parseInt(selectedAuction.id),
          vendorId: currentUserId,
          vendorName: "Current User", // You can make this dynamic
          price: newBid.price,
          deliveryTime: newBid.deliveryTime,
          description: newBid.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit bid")
      }

      const result = await response.json()
      console.log("Bid submitted successfully:", result)

      // Reset form and close modal
      setNewBid({
        price: 0,
        deliveryTime: "",
        description: "",
      })
      setShowBidModal(false)
      setSelectedAuction(null)

      // Refresh data
      await fetchAvailableAuctions()
      await fetchCurrentBids()
    } catch (err) {
      console.error("Error submitting bid:", err)
      setError(err instanceof Error ? err.message : "Failed to submit bid")
    } finally {
      setSubmittingBid(false)
    }
  }

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([fetchAvailableAuctions(), fetchCurrentBids(), fetchBidHistory()])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUserId, fetchAvailableAuctions, fetchCurrentBids, fetchBidHistory])

  // Filter functions
  const filteredAvailableAuctions = availableAuctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || auction.category === selectedCategory),
  )

  const filteredCurrentBids = currentBids.filter((bid) =>
    bid.auctionTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredBidHistory = bidHistory.filter((bid) =>
    bid.auctionTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "accepted":
        return "status-accepted"
      case "rejected":
        return "status-rejected"
      case "outbid":
        return "status-outbid"
      case "won":
        return "status-won"
      case "lost":
        return "status-lost"
      case "expired":
        return "status-expired"
      default:
        return "status-pending"
    }
  }

  // Calculate stats
  const totalActiveBids = currentBids.length
  const totalBidValue = currentBids.reduce((sum, bid) => sum + bid.bidAmount, 0)
  const winRate =
    Math.round((bidHistory.filter((bid) => bid.finalStatus === "won").length / bidHistory.length) * 100) || 0
  const avgBidAmount = Math.round(bidHistory.reduce((sum, bid) => sum + bid.bidAmount, 0) / bidHistory.length) || 0

  // Loading state
  if (loading) {
    return (
      <div className="wholesale-panel">
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
          <p>Loading wholesale data...</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
            color: #059669;
          }
          .loading-spinner {
            width: 3rem;
            height: 3rem;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="wholesale-panel">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <XCircle className="error-icon" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">
            <XCircle className="close-icon" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Wholesale Bidding Portal</h1>
            <p className="dashboard-subtitle">Manage your bids and discover new opportunities</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Gavel className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{totalActiveBids}</div>
                <div className="stat-label">Active Bids</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">
                <DollarSign className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{formatCurrency(totalBidValue).replace(".00", "")}</div>
                <div className="stat-label">Total Bid Value</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <TrendingUp className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{winRate}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">
                <Target className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{formatCurrency(avgBidAmount).replace(".00", "")}</div>
                <div className="stat-label">Avg Bid</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <div className="nav-tabs">
          <button
            onClick={() => setActiveTab("current-bids")}
            className={`nav-tab ${activeTab === "current-bids" ? "active" : ""}`}
          >
            <Clock className="tab-icon" />
            Current Bids
          </button>
          <button
            onClick={() => setActiveTab("available-auctions")}
            className={`nav-tab ${activeTab === "available-auctions" ? "active" : ""}`}
          >
            <Search className="tab-icon" />
            Available Auctions
          </button>
          <button
            onClick={() => setActiveTab("bid-history")}
            className={`nav-tab ${activeTab === "bid-history" ? "active" : ""}`}
          >
            <Award className="tab-icon" />
            Bid History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Search and Filters */}
        <div className="content-header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {activeTab === "available-auctions" && (
            <div className="filter-container">
              <Filter className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Current Bids Tab */}
        {activeTab === "current-bids" && (
          <div className="bids-grid">
            {filteredCurrentBids.length === 0 ? (
              <div className="empty-state">
                <Gavel className="empty-icon" />
                <h3>No Active Bids</h3>
                <p>You haven&apos;t placed any bids yet. Check out the available auctions to get started!</p>
              </div>
            ) : (
              filteredCurrentBids.map((bid) => (
                <div key={bid.id} className="bid-card">
                  <div className="bid-header">
                    <h3 className="bid-title">{bid.auctionTitle}</h3>
                    <span className={`bid-status ${getStatusColor(bid.status)}`}>{bid.status}</span>
                  </div>
                  <div className="bid-amount-section">
                    <div className="bid-amount">
                      <span className="amount-label">Your Bid:</span>
                      <span className="amount-value">{formatCurrency(bid.bidAmount)}</span>
                    </div>
                    {bid.isHighestBid && (
                      <div className="highest-bid-badge">
                        <Star className="star-icon" />
                        Highest Bid
                      </div>
                    )}
                  </div>
                  <p className="bid-description">{bid.description}</p>
                  <div className="bid-details">
                    <div className="detail-item">
                      <Truck className="detail-icon" />
                      <span>{bid.deliveryTime}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>Deadline: {bid.auctionDeadline}</span>
                    </div>
                    <div className="detail-item">
                      <Users className="detail-icon" />
                      <span>{bid.competitorBids} competitors</span>
                    </div>
                    <div className="detail-item">
                      <DollarSign className="detail-icon" />
                      <span>Budget: {formatCurrency(bid.auctionBudget)}</span>
                    </div>
                  </div>
                  <div className="bid-footer">
                    <div className="submitted-date">Submitted: {new Date(bid.submittedAt).toLocaleDateString()}</div>
                    <div className="bid-actions">
                      <button className="btn-message">
                        <MessageSquare className="btn-icon" />
                        Message
                      </button>
                      {bid.status === "outbid" && (
                        <button className="btn-rebid">
                          <Plus className="btn-icon" />
                          Rebid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Available Auctions Tab */}
        {activeTab === "available-auctions" && (
          <div className="auctions-grid">
            {filteredAvailableAuctions.length === 0 ? (
              <div className="empty-state">
                <Search className="empty-icon" />
                <h3>No Auctions Found</h3>
                <p>No auctions match your current search criteria. Try adjusting your filters.</p>
              </div>
            ) : (
              filteredAvailableAuctions.map((auction) => (
                <div key={auction.id} className="auction-card">
                  <div className="auction-header">
                    <h3 className="auction-title">{auction.title}</h3>
                    <span className={`auction-status ${getStatusColor(auction.status)}`}>{auction.status}</span>
                  </div>
                  <p className="auction-description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="detail-item">
                      <Package className="detail-icon" />
                      <span>
                        {auction.quantity} {auction.unit}
                      </span>
                    </div>
                    <div className="detail-item">
                      <DollarSign className="detail-icon" />
                      <span>Budget: {formatCurrency(auction.budget)}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>{auction.deadline}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span>{auction.location}</span>
                    </div>
                  </div>
                  {auction.currentHighestBid && (
                    <div className="current-highest-bid">
                      <TrendingUp className="trend-icon" />
                      <span>Current highest: {formatCurrency(auction.currentHighestBid)}</span>
                    </div>
                  )}
                  <div className="auction-footer">
                    <div className="bid-info">
                      <div className="bid-count">
                        <Users className="bid-icon" />
                        <span>{auction.bidsCount} bids</span>
                      </div>
                      {auction.currentHighestBid && (
                        <div className="highest-bid-info">
                          <TrendingUp className="trend-icon" />
                          <span>Highest: {formatCurrency(auction.currentHighestBid)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        router.push("vendor-game")
                      }}
                      className="place-bid-btn"
                    >
                      <Gavel className="btn-icon" />
                      Place Bid
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bid History Tab */}
        {activeTab === "bid-history" && (
          <div className="history-grid">
            {filteredBidHistory.length === 0 ? (
              <div className="empty-state">
                <Award className="empty-icon" />
                <h3>No Bid History</h3>
                <p>Your completed bids will appear here once you start participating in auctions.</p>
              </div>
            ) : (
              filteredBidHistory.map((bid) => (
                <div key={bid.id} className="history-card">
                  <div className="history-header">
                    <h3 className="history-title">{bid.auctionTitle}</h3>
                    <span className={`history-status ${getStatusColor(bid.finalStatus)}`}>{bid.finalStatus}</span>
                  </div>
                  <div className="history-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Your Bid:</span>
                      <span className="amount-value">{formatCurrency(bid.bidAmount)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Budget:</span>
                      <span className="amount-value">{formatCurrency(bid.auctionBudget)}</span>
                    </div>
                    {bid.winningBid && (
                      <div className="amount-item">
                        <span className="amount-label">Winning Bid:</span>
                        <span className="amount-value">{formatCurrency(bid.winningBid)}</span>
                      </div>
                    )}
                  </div>
                  <div className="history-dates">
                    <div className="date-item">
                      <Calendar className="date-icon" />
                      <span>Submitted: {new Date(bid.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="date-item">
                      <CheckCircle className="date-icon" />
                      <span>Completed: {new Date(bid.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedAuction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Place Bid</h2>
              <button onClick={() => setShowBidModal(false)} className="modal-close">
                <XCircle className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="auction-summary">
                <h3>{selectedAuction.title}</h3>
                <p>{selectedAuction.description}</p>
                <div className="summary-details">
                  <span>Budget: {formatCurrency(selectedAuction.budget)}</span>
                  <span>
                    Quantity: {selectedAuction.quantity} {selectedAuction.unit}
                  </span>
                  <span>Deadline: {selectedAuction.deadline}</span>
                  {selectedAuction.currentHighestBid && (
                    <span>Current Highest: {formatCurrency(selectedAuction.currentHighestBid)}</span>
                  )}
                </div>
              </div>
              <div className="bid-form">
                <div className="form-group">
                  <label className="form-label">Your Bid Price ($) *</label>
                  <input
                    type="number"
                    value={newBid.price || ""}
                    onChange={(e) => setNewBid({ ...newBid, price: Number.parseFloat(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                    step="0.01"
                    placeholder="Enter your bid amount"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Time *</label>
                  <input
                    type="text"
                    value={newBid.deliveryTime}
                    onChange={(e) => setNewBid({ ...newBid, deliveryTime: e.target.value })}
                    className="form-input"
                    placeholder="e.g., 5-7 business days"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={newBid.description}
                    onChange={(e) => setNewBid({ ...newBid, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Describe your offer, terms, warranty, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBidModal(false)} className="btn-secondary" disabled={submittingBid}>
                Cancel
              </button>
              <button
                onClick={handleSubmitBid}
                className="btn-primary"
                disabled={submittingBid || !newBid.price || !newBid.deliveryTime}
              >
                {submittingBid ? (
                  <>
                    <Loader2 className="btn-icon spinning" />
                    Submitting...
                  </>
                ) : (
                  "Submit Bid"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Wholesale Panel Styles - Emerald/Green/Blue/White Color Scheme */
        .wholesale-panel {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f0f9ff 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          color: #1f2937;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Error Banner */
        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .error-icon {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .error-close {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          margin-left: auto;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          color: #059669;
          grid-column: 1 / -1;
        }

        .empty-icon {
          width: 4rem;
          height: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #10b981;
          max-width: 400px;
        }

        /* Spinning animation for loading */
        .spinning {
          animation: spin 1s linear infinite;
        }

        /* Dashboard Header */
        .dashboard-header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid #d1fae5;
          padding: 2rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-left {
          flex: 1;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          color: #059669;
          font-size: 1.125rem;
        }

        .header-stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(236, 253, 245, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid #bbf7d0;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 140px;
        }

        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.blue {
          background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
        }

        .stat-icon.purple {
          background: linear-gradient(135deg, #a78bfa 0%, #6366f1 100%);
        }

        .stat-icon.green {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        }

        .stat-icon.orange {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
        }

        .stat-icon .icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #fff;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #10b981;
        }

        /* Navigation */
        .dashboard-nav {
          background: rgba(236, 253, 245, 0.7);
          border-bottom: 1px solid #bbf7d0;
          padding: 0 2rem;
        }

        .nav-tabs {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 0.5rem;
        }

        .nav-tab {
          background: none;
          border: none;
          color: #059669;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 0.5rem 0.5rem 0 0;
          position: relative;
        }

        .nav-tab:hover {
          color: #047857;
          background: #f0fdf4;
        }

        .nav-tab.active {
          color: #059669;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-bottom: 2px solid #10b981;
        }

        .tab-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Main Content */
        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .content-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #10b981;
        }

        .search-input {
          width: 100%;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem 0.75rem 3rem;
          color: #059669;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .search-input::placeholder {
          color: #6ee7b7;
        }

        .search-input:focus {
          outline: none;
          border-color: #059669;
          background: #dcfce7;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
        }

        .filter-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #10b981;
        }

        .filter-select {
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: #059669;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #059669;
          background: #dcfce7;
        }

        /* Grids */
        .bids-grid,
        .auctions-grid,
        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        /* Bid Cards */
        .bid-card {
          background: rgba(236, 253, 245, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid #bbf7d0;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .bid-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.13);
          border-color: #10b981;
        }

        .bid-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .bid-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #059669;
          flex: 1;
          line-height: 1.4;
        }

        .bid-status {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .status-pending {
          background: rgba(251, 191, 36, 0.15);
          color: #f59e0b;
          border: 1px solid #fde68a;
        }

        .status-accepted {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
          border: 1px solid #bbf7d0;
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid #fecaca;
        }

        .status-outbid {
          background: rgba(249, 115, 22, 0.12);
          color: #ea580c;
          border: 1px solid #fed7aa;
        }

        .status-won {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
          border: 1px solid #bbf7d0;
        }

        .status-lost {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid #fecaca;
        }

        .status-expired {
          background: rgba(107, 114, 128, 0.12);
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .bid-amount-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(220, 252, 231, 0.5);
          border-radius: 0.75rem;
        }

        .bid-amount {
          display: flex;
          flex-direction: column;
        }

        .amount-label {
          font-size: 0.875rem;
          color: #10b981;
          margin-bottom: 0.25rem;
        }

        .amount-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }

        .highest-bid-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .star-icon {
          width: 1rem;
          height: 1rem;
          fill: currentColor;
        }

        .bid-description {
          color: #059669;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .bid-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.875rem;
        }

        .detail-icon {
          width: 1rem;
          height: 1rem;
          color: #6ee7b7;
        }

        .bid-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #bbf7d0;
        }

        .submitted-date {
          color: #10b981;
          font-size: 0.875rem;
        }

        .bid-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-message,
        .btn-rebid {
          background: #e0f2fe;
          color: #059669;
          border: 1.5px solid #bbf7d0;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-message:hover,
        .btn-rebid:hover {
          background: #dcfce7;
          border-color: #059669;
        }

        .btn-rebid {
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          color: #fff;
          border: none;
        }

        .btn-rebid:hover {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transform: translateY(-1px);
        }

        /* Auction Cards */
        .auction-card {
          background: rgba(236, 253, 245, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid #bbf7d0;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .auction-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.13);
          border-color: #10b981;
        }

        .auction-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .auction-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #059669;
          flex: 1;
          line-height: 1.4;
        }

        .auction-status {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
          border: 1px solid #bbf7d0;
        }

        .auction-description {
          color: #059669;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .auction-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .current-highest-bid {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          padding: 0.75rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .trend-icon {
          width: 1rem;
          height: 1rem;
        }

        .auction-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #bbf7d0;
        }

        .bid-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bid-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.875rem;
        }

        .highest-bid-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .bid-icon,
        .trend-icon {
          width: 1rem;
          height: 1rem;
          color: #6ee7b7;
        }

        .place-bid-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .place-bid-btn:hover {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transform: translateY(-1px);
        }

        .btn-icon {
          width: 1rem;
          height: 1rem;
        }

        /* History Cards */
        .history-card {
          background: rgba(236, 253, 245, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid #bbf7d0;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .history-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.13);
          border-color: #10b981;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .history-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #059669;
          flex: 1;
          line-height: 1.4;
        }

        .history-status {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .history-amounts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(220, 252, 231, 0.5);
          border-radius: 0.75rem;
        }

        .amount-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-dates {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.875rem;
        }

        .date-icon {
          width: 1rem;
          height: 1rem;
          color: #6ee7b7;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(16, 185, 129, 0.08);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: #f0fdf4;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1.5px solid #bbf7d0;
          border-radius: 1rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.13);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #bbf7d0;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #059669;
        }

        .modal-close {
          background: none;
          border: none;
          color: #10b981;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .modal-close:hover {
          color: #059669;
        }

        .close-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #bbf7d0;
        }

        /* Auction Summary */
        .auction-summary {
          background: #e0f2fe;
          border: 1.5px solid #bbf7d0;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .auction-summary h3 {
          color: #059669;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .auction-summary p {
          color: #10b981;
          margin-bottom: 1rem;
        }

        .summary-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6ee7b7;
        }

        /* Form Styles */
        .bid-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          color: #059669;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-input,
        .form-textarea {
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: #059669;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #6ee7b7;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #059669;
          background: #dcfce7;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Button Styles */
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #e0f2fe;
          color: #059669;
          border: 1.5px solid #bbf7d0;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #dcfce7;
          border-color: #059669;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .header-stats {
            width: 100%;
            justify-content: space-between;
          }

          .stat-card {
            min-width: auto;
            flex: 1;
          }

          .bids-grid,
          .auctions-grid,
          .history-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .content-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            max-width: none;
          }

          .bid-details,
          .auction-details {
            grid-template-columns: 1fr;
          }

          .bid-footer,
          .auction-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .bid-amount-section {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .history-amounts {
            gap: 0.75rem;
          }

          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }
        }

        @media (max-width: 480px) {
          .dashboard-title {
            font-size: 2rem;
          }

          .header-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-tabs {
            flex-direction: column;
            gap: 0.25rem;
          }

          .summary-details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .bid-actions {
            flex-direction: column;
          }
        }

        @media (prefers-contrast: high) {
          .bid-card,
          .auction-card,
          .history-card,
          .modal-content,
          .stat-card {
            border-width: 2px;
          }

          .bid-status,
          .auction-status,
          .history-status {
            border-width: 2px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

export default WholesalePanel