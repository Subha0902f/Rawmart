"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  Package,
  Gavel,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  MapPin,
  Truck,
  MessageSquare,
} from "lucide-react"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, type User } from "firebase/auth"
import "./vendor-dashboard.css"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Type definitions
interface AuctionItem {
  id: string
  title: string
  category: string
  qualitySpecs: string
  quantity: number
  unit: string
  startingBid: number
  currentPrice: number | null
  auctionDuration: string
  deliveryLocation: string
  status: "active" | "closed" | "assigned" | "stopped"
  bids: number
  leadingBid: string | null
  createdAt: string
  urgent: boolean
  createdBy: string
}

interface Bid {
  id: string
  auctionId: string
  vendorName: string
  vendorRating: number
  price: number
  deliveryTime: string
  description: string
  createdAt: string
  status: "pending" | "accepted" | "rejected"
}

interface Category {
  id: string
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  itemCount: number
}

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState<"my-auctions" | "create-auction" | "browse-auctions">("my-auctions")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [myAuctions, setMyAuctions] = useState<AuctionItem[]>([])
  const [availableAuctions, setAvailableAuctions] = useState<AuctionItem[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sample categories
  const categories: Category[] = [
    { id: "electronics", name: "Electronics", icon: Package, itemCount: 45 },
    { id: "furniture", name: "Furniture", icon: Package, itemCount: 32 },
    { id: "machinery", name: "Machinery", icon: Package, itemCount: 28 },
    { id: "supplies", name: "Office Supplies", icon: Package, itemCount: 67 },
    { id: "services", name: "Services", icon: Users, itemCount: 23 },
    { id: "materials", name: "Raw Materials", icon: Package, itemCount: 41 },
  ]

  // State for new auction form with default valid numbers
  const [newAuction, setNewAuction] = useState({
    title: "",
    category: "",
    qualitySpecs: "",
    quantity: 1,
    unit: "units",
    startingBid: 0,
    auctionDuration: "",
    deliveryLocation: "",
    urgent: false,
  })

  // State for new bid form with default valid number
  const [newBid, setNewBid] = useState({
    price: 0,
    deliveryTime: "",
    description: "",
  })

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        fetchUserAuctions(currentUser.uid)
        fetchAvailableAuctions()
      } else {
        setMyAuctions([])
        setAvailableAuctions([])
      }
    })

    return () => unsubscribe()
  }, [])

  // Fetch user-specific auctions
  const fetchUserAuctions = async (firebaseUserId: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching user auctions for:", firebaseUserId)

      const response = await fetch("http://localhost:3001/api/user-orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw user orders data:", data)

      // Debug status field types
      if (data.length > 0) {
        console.log("First order status:", data[0].status, "Type:", typeof data[0].status)
      }

      const userAuctions = data
        .filter((order: AuctionItem) => order.createdBy === firebaseUserId)
        .map((order: AuctionItem) => ({
          id: order.id?.toString() || Math.random().toString(),
          title: order.title || "Untitled",
          category: order.category || "unknown",
          qualitySpecs: order.qualitySpecs || "No description provided",
          quantity: Number(order.quantity) || 1,
          unit: order.unit || "units",
          startingBid: Number(order.startingBid) || 0,
          currentPrice: order.currentPrice ? Number(order.currentPrice) : null,
          auctionDuration: order.auctionDuration ? order.auctionDuration.split("T")[0] : "",
          deliveryLocation: order.deliveryLocation || "Unknown",
          status: String(order.status || "active").toLowerCase() as "active" | "closed" | "assigned" | "stopped",
          bids: Number(order.bids) || 0,
          leadingBid: order.leadingBid || null,
          createdAt: order.createdAt ? order.createdAt.split("T")[0] : "",
          urgent: !!order.urgent,
          createdBy: firebaseUserId,
        }))

      console.log("Processed user auctions:", userAuctions)
      setMyAuctions(userAuctions)
    } catch (error) {
      console.error("Error fetching user auctions:", error)
      setError(`Failed to fetch your auctions: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all available auctions
  const fetchAvailableAuctions = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching available auctions...")

      const response = await fetch("http://localhost:3001/api/auctions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw auctions data:", data)

      // Debug status field types
      if (data.length > 0) {
        console.log("First auction status:", data[0].status, "Type:", typeof data[0].status)
      }

      const auctions = data.map((auction: AuctionItem) => ({
        id: auction.id?.toString() || Math.random().toString(),
        title: auction.title || "Untitled",
        category: auction.category || "unknown",
        qualitySpecs: auction.qualitySpecs || "No description provided",
        quantity: Number(auction.quantity) || 1,
        unit: auction.unit || "units",
        startingBid: Number(auction.startingBid) || 0,
        currentPrice: auction.currentPrice ? Number(auction.currentPrice) : null,
        auctionDuration: auction.auctionDuration ? auction.auctionDuration.split("T")[0] : "",
        deliveryLocation: auction.deliveryLocation || "Unknown",
        status: String(auction.status || "active").toLowerCase() as "active" | "closed" | "assigned" | "stopped",
        bids: Number(auction.bids) || 0,
        leadingBid: auction.leadingBid || null,
        createdAt: auction.createdAt ? auction.createdAt.split("T")[0] : "",
        urgent: !!auction.urgent,
        createdBy: "other-vendor",
      }))

      console.log("Processed auctions:", auctions)
      setAvailableAuctions(auctions)
    } catch (error) {
      console.error("Error fetching available auctions:", error)
      setError(`Failed to fetch available auctions: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAuction = async () => {
    if (!user) {
      setError("You must be logged in to create an auction.")
      return
    }

    // Validate form inputs
    if (
      !newAuction.title ||
      !newAuction.category ||
      !newAuction.quantity ||
      !newAuction.unit ||
      !newAuction.startingBid ||
      !newAuction.auctionDuration ||
      !newAuction.deliveryLocation
    ) {
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:3001/api/create-auction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newAuction.title,
          category: newAuction.category,
          qualitySpecs: newAuction.qualitySpecs,
          quantity: Number(newAuction.quantity),
          unit: newAuction.unit,
          startingBid: Number(newAuction.startingBid),
          auctionDuration: newAuction.auctionDuration,
          deliveryLocation: newAuction.deliveryLocation,
          urgent: newAuction.urgent,
          firebaseUserId: user.uid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Auction created:", data)

      const auction: AuctionItem = {
        id: data.orderId.toString(),
        title: newAuction.title,
        category: newAuction.category,
        qualitySpecs: newAuction.qualitySpecs,
        quantity: Number(newAuction.quantity),
        unit: newAuction.unit,
        startingBid: Number(newAuction.startingBid),
        currentPrice: null,
        auctionDuration: newAuction.auctionDuration,
        deliveryLocation: newAuction.deliveryLocation,
        status: "active",
        bids: 0,
        leadingBid: null,
        createdAt: new Date().toISOString().split("T")[0],
        urgent: newAuction.urgent,
        createdBy: user.uid,
      }

      setMyAuctions([auction, ...myAuctions])
      setNewAuction({
        title: "",
        category: "",
        qualitySpecs: "",
        quantity: 1,
        unit: "units",
        startingBid: 0,
        auctionDuration: "",
        deliveryLocation: "",
        urgent: false,
      })
      setShowCreateForm(false)
      setActiveTab("my-auctions")
      setError(null)
    } catch (error) {
      console.error("Error creating auction:", error)
      setError(`Failed to create auction: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStopAuction = async (orderId: string) => {
    if (!user) {
      setError("You must be logged in to stop an auction.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:3001/api/stop-auction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: Number(orderId),
          firebaseUserId: user.uid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Auction stopped:", data)

      setMyAuctions((prev) =>
        prev.map((auction) =>
          auction.id === orderId ? { ...auction, status: "stopped" as const } : auction
        )
      )
    } catch (error) {
      console.error("Error stopping auction:", error)
      setError(`Failed to stop auction: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBid = () => {
    if (!user || !selectedAuction) return

    if (!newBid.price || !newBid.deliveryTime) {
      alert("Please fill in all required bid fields.")
      return
    }

    const bid: Bid = {
      id: Date.now().toString(),
      auctionId: selectedAuction.id,
      vendorName: user.displayName || "Your Company",
      vendorRating: 4.7,
      price: Number(newBid.price),
      deliveryTime: newBid.deliveryTime,
      description: newBid.description,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setBids([bid, ...bids])
    setNewBid({
      price: 0,
      deliveryTime: "",
      description: "",
    })
    setShowBidModal(false)
    setSelectedAuction(null)
  }

  const filteredMyAuctions = myAuctions.filter((auction) =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAvailableAuctions = availableAuctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || auction.category === selectedCategory),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active"
      case "closed":
        return "status-closed"
      case "assigned":
        return "status-assigned"
      case "stopped":
        return "status-stopped"
      default:
        return "status-active"
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="vendor-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Vendor Auction Platform</h1>
          <p className="dashboard-subtitle">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vendor-dashboard">
      {/* Error Display */}
      {error && (
        <div
          className="error-message"
          style={{
            color: "red",
            padding: "10px",
            textAlign: "center",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            margin: "10px",
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: "10px", background: "none", border: "none", color: "red", cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading auctions...</p>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Vendor Auction Platform</h1>
            <p className="dashboard-subtitle">Welcome, {user.displayName || "User"}!</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Gavel className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{myAuctions.length}</div>
                <div className="stat-label">Your Auctions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">
                <DollarSign className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {formatCurrency(myAuctions.reduce((sum, auction) => sum + (auction.startingBid || 0), 0))}
                </div>
                <div className="stat-label">Total Budget</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <Users className="icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{availableAuctions.length}</div>
                <div className="stat-label">Available Auctions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <div className="nav-tabs">
          <button
            onClick={() => setActiveTab("my-auctions")}
            className={`nav-tab ${activeTab === "my-auctions" ? "active" : ""}`}
          >
            <Package className="tab-icon" />
            My Auctions
          </button>
          <button
            onClick={() => setActiveTab("browse-auctions")}
            className={`nav-tab ${activeTab === "browse-auctions" ? "active" : ""}`}
          >
            <Search className="tab-icon" />
            Browse Auctions
          </button>
          <button
            onClick={() => {
              setActiveTab("create-auction")
              setShowCreateForm(true)
            }}
            className="nav-tab create-btn"
          >
            <Plus className="tab-icon" />
            Create Auction
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
          {activeTab === "browse-auctions" && (
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
                    {category.name} ({category.itemCount})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* My Auctions Tab */}
        {activeTab === "my-auctions" && (
          <div className="auctions-grid">
            {filteredMyAuctions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>
                  No auctions found.{" "}
                  {myAuctions.length === 0 ? "Create your first auction!" : "Try adjusting your search."}
                </p>
              </div>
            ) : (
              filteredMyAuctions.map((auction) => (
                <div key={auction.id} className="auction-card">
                  <div className="auction-header">
                    <h3 className="auction-title">{auction.title}</h3>
                    <span className={`auction-status ${getStatusColor(auction.status)}`}>{auction.status}</span>
                  </div>
                  <p className="auction-description">{auction.qualitySpecs}</p>
                  <div className="auction-details">
                    <div className="detail-item">
                      <Package className="detail-icon" />
                      <span>
                        {auction.quantity} {auction.unit}
                      </span>
                    </div>
                    <div className="detail-item">
                      <DollarSign className="detail-icon" />
                      <span>{formatCurrency(auction.startingBid)}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>{auction.auctionDuration}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span>{auction.deliveryLocation}</span>
                    </div>
                  </div>
                  <div className="auction-footer">
                    <div className="bid-count">
                      <Users className="bid-icon" />
                      <span>{auction.bids} bids</span>
                    </div>
                    {auction.status === "active" && (
                      <button onClick={() => handleStopAuction(auction.id)} className="stop-bid-btn">
                        <XCircle className="btn-icon" />
                        Stop Bid
                      </button>
                    )}
                    <button onClick={() => setSelectedAuction(auction)} className="view-bids-btn">
                      <Eye className="btn-icon" />
                      View Bids
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Browse Auctions Tab */}
        {activeTab === "browse-auctions" && (
          <div className="auctions-grid">
            {filteredAvailableAuctions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>
                  No auctions found.{" "}
                  {availableAuctions.length === 0
                    ? "No auctions available at the moment."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
            ) : (
              filteredAvailableAuctions.map((auction) => (
                <div key={auction.id} className="auction-card">
                  <div className="auction-header">
                    <h3 className="auction-title">{auction.title}</h3>
                    <span className={`auction-status ${getStatusColor(auction.status)}`}>{auction.status}</span>
                  </div>
                  <div className="auction-description">{auction.qualitySpecs}</div>
                  <div className="auction-details">
                    <div className="detail-item">
                      <Package className="detail-icon" />
                      <span>
                        {auction.quantity} {auction.unit}
                      </span>
                    </div>
                    <div className="detail-item">
                      <DollarSign className="detail-icon" />
                      <span>{formatCurrency(auction.startingBid)}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>{auction.auctionDuration}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span>{auction.deliveryLocation}</span>
                    </div>
                  </div>
                  <div className="auction-footer">
                    <div className="bid-count">
                      <Users className="bid-icon" />
                      <span>{auction.bids} bids</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAuction(auction)
                        setShowBidModal(true)
                      }}
                      className="place-bid-btn"
                      disabled={auction.status !== "active"}
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
      </div>

      {/* Create Auction Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create New Auction</h2>
              <button onClick={() => setShowCreateForm(false)} className="modal-close">
                <XCircle className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={newAuction.title}
                    onChange={(e) => setNewAuction({ ...newAuction, title: e.target.value })}
                    className="form-input"
                    placeholder="Enter auction title"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newAuction.category}
                    onChange={(e) => setNewAuction({ ...newAuction, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Quality Specifications</label>
                  <textarea
                    value={newAuction.qualitySpecs}
                    onChange={(e) => setNewAuction({ ...newAuction, qualitySpecs: e.target.value })}
                    className="form-textarea"
                    placeholder="Describe what you need"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    value={newAuction.quantity || ""}
                    onChange={(e) =>
                      setNewAuction({
                        ...newAuction,
                        quantity: e.target.value ? Number.parseInt(e.target.value) : 1,
                      })
                    }
                    className="form-input"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    value={newAuction.unit}
                    onChange={(e) => setNewAuction({ ...newAuction, unit: e.target.value })}
                    className="form-select"
                  >
                    <option value="units">Units</option>
                    <option value="pieces">Pieces</option>
                    <option value="sets">Sets</option>
                    <option value="projects">Projects</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Starting Bid ($)</label>
                  <input
                    type="number"
                    value={newAuction.startingBid || ""}
                    onChange={(e) =>
                      setNewAuction({
                        ...newAuction,
                        startingBid: e.target.value ? Number.parseFloat(e.target.value) : 0,
                      })
                    }
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Auction End Date</label>
                  <input
                    type="date"
                    value={newAuction.auctionDuration}
                    onChange={(e) => setNewAuction({ ...newAuction, auctionDuration: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Delivery Location</label>
                  <input
                    type="text"
                    value={newAuction.deliveryLocation}
                    onChange={(e) => setNewAuction({ ...newAuction, deliveryLocation: e.target.value })}
                    className="form-input"
                    placeholder="Enter delivery location"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Urgent</label>
                  <input
                    type="checkbox"
                    checked={newAuction.urgent}
                    onChange={(e) => setNewAuction({ ...newAuction, urgent: e.target.checked })}
                    className="form-checkbox"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateAuction} className="btn-primary">
                Create Auction
              </button>
            </div>
          </div>
        </div>
      )}

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
                <p>{selectedAuction.qualitySpecs}</p>
                <div className="summary-details">
                  <span>Starting Bid: {formatCurrency(selectedAuction.startingBid)}</span>
                  <span>
                    Quantity: {selectedAuction.quantity} {selectedAuction.unit}
                  </span>
                  <span>Deadline: {selectedAuction.auctionDuration}</span>
                </div>
              </div>
              <div className="bid-form">
                <div className="form-group">
                  <label className="form-label">Your Bid Price ($)</label>
                  <input
                    type="number"
                    value={newBid.price || ""}
                    onChange={(e) =>
                      setNewBid({
                        ...newBid,
                        price: e.target.value ? Number.parseFloat(e.target.value) : 0,
                      })
                    }
                    className="form-input"
                    min="0"
                    step="0.01"
                    placeholder="Enter your bid amount"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Time</label>
                  <input
                    type="text"
                    value={newBid.deliveryTime}
                    onChange={(e) => setNewBid({ ...newBid, deliveryTime: e.target.value })}
                    className="form-input"
                    placeholder="e.g., 5-7 business days"
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
              <button onClick={() => setShowBidModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmitBid} className="btn-primary">
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bids Modal */}
      {selectedAuction && !showBidModal && !showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2 className="modal-title">Bids for: {selectedAuction.title}</h2>
              <button onClick={() => setSelectedAuction(null)} className="modal-close">
                <XCircle className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="bids-list">
                {bids
                  .filter((bid) => bid.auctionId === selectedAuction.id)
                  .map((bid) => (
                    <div key={bid.id} className="bid-card">
                      <div className="bid-header">
                        <div className="vendor-info">
                          <h4 className="vendor-name">{bid.vendorName}</h4>
                          <div className="vendor-rating">
                            <Star className="star-icon" />
                            <span>{bid.vendorRating}</span>
                          </div>
                        </div>
                        <div className="bid-price">{formatCurrency(bid.price)}</div>
                      </div>
                      <div className="bid-details">
                        <div className="detail-item">
                          <Truck className="detail resonances-icon" />
                          <span>{bid.deliveryTime}</span>
                        </div>
                        <div className="detail-item">
                          <Calendar className="detail-icon" />
                          <span>Submitted: {bid.createdAt}</span>
                        </div>
                      </div>
                      <p className="bid-description">{bid.description}</p>
                      <div className="bid-actions">
                        <button className="btn-accept">
                          <CheckCircle className="btn-icon" />
                          Accept Bid
                        </button>
                        <button className="btn-message">
                          <MessageSquare className="btn-icon" />
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                {bids.filter((bid) => bid.auctionId === selectedAuction.id).length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    <p>No bids yet for this auction.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDashboard