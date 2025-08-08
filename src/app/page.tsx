"use client"
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

// Types for API data
interface ApiAuction {
  orderId: number
  auctionDuration: string
  bids: number
  category: string
  createdAt: string
  currentPrice: number
  deliveryLocation: string
  leadingBid: string
  qualitySpecs: string
  quantity: number
  startingBid: number
  status: string
  title: string
  unit: string
  urgent: number
}

interface ProcessedAuction {
  id: number
  title: string
  vendor: string
  location: string
  currentBid: number
  startingBid: number
  unit: string
  timeLeft: string
  totalBids: number
  leadingBidder: string
  category: string
  urgent: boolean
  verified: boolean
  description: string
}

// Interactive Quiz Component for vendor onboarding
function VendorQuizComponent() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)

  const questions = [
    {
      question: "What's your biggest challenge in sourcing raw materials?",
      options: [
        "High prices from traditional suppliers",
        "Inconsistent quality and delivery",
        "Limited supplier network",
        "Payment terms and credit issues",
      ],
    },
    {
      question: "How much do you typically spend on raw materials monthly?",
      options: ["Under ₹10,000", "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "Above ₹50,000"],
    },
    {
      question: "What would motivate you to switch suppliers?",
      options: ["20%+ cost savings", "Better quality assurance", "Faster delivery times", "Flexible payment options"],
    },
  ]

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowResults(false)
  }

  const getPersonalizedResult = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0)
    if (totalScore <= 3) {
      return {
        title: "🎯 Perfect Fit for Rawmart!",
        message:
          "You're exactly who we built this platform for. Join now and start saving up to 30% on your raw materials!",
        benefit: "Estimated Monthly Savings: ₹3,000 - ₹8,000",
      }
    } else if (totalScore <= 6) {
      return {
        title: "🚀 High Savings Potential",
        message:
          "Our competitive bidding will solve your supply chain challenges. Get multiple wholesalers competing for your business!",
        benefit: "Estimated Monthly Savings: ₹5,000 - ₹15,000",
      }
    } else {
      return {
        title: "💎 Premium Member Material",
        message:
          "You're a serious business owner ready for our advanced features. Access exclusive wholesale networks and bulk deals!",
        benefit: "Estimated Monthly Savings: ₹10,000 - ₹25,000",
      }
    }
  }

  if (showResults) {
    const result = getPersonalizedResult()
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: "1rem",
          padding: "2rem",
          color: "white",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{result.title}</h3>
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>{result.message}</p>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <strong>{result.benefit}</strong>
        </div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={resetQuiz}
            style={{
              background: "white",
              color: "#059669",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Take Quiz Again
          </button>
          <button
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🚀 Join Rawmart Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "1rem",
        padding: "2rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span style={{ color: "#059669", fontWeight: "600" }}>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <div
            style={{
              background: "#e5e7eb",
              borderRadius: "1rem",
              height: "0.5rem",
              width: "100px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#059669",
                height: "100%",
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
        <h3 style={{ fontSize: "1.25rem", color: "#111827", marginBottom: "1.5rem" }}>
          {questions[currentQuestion].question}
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            style={{
              padding: "1rem",
              border: "2px solid #e5e7eb",
              borderRadius: "0.5rem",
              background: "white",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#059669"
              e.currentTarget.style.background = "#f0fdf4"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb"
              e.currentTarget.style.background = "white"
            }}
          >
            <span style={{ marginRight: "0.75rem", color: "#059669", fontWeight: "bold" }}>
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function RawmartPlatform() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [watchedAuctions, setWatchedAuctions] = useState(0)
  const [savedAuctions, setSavedAuctions] = useState<number[]>([])
  const [email, setEmail] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // API Integration State
  const [auctions, setAuctions] = useState<ProcessedAuction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // References for scrolling to sections
  const problemRef = useRef<HTMLDivElement>(null)
  const solutionRef = useRef<HTMLDivElement>(null)
  const auctionsRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)

  // Dummy data fallback function
  const createDummyAuctions = (): ProcessedAuction[] => [
    {
      id: 1,
      title: "Fresh Onions Required - 500 kg",
      vendor: "Mumbai Vada Pav Corner",
      location: "Dadar, Mumbai",
      currentBid: 28,
      startingBid: 35,
      unit: "per kg",
      timeLeft: "2h 15m",
      totalBids: 12,
      leadingBidder: "Wholesale Veggie Hub",
      category: "vegetables",
      urgent: true,
      verified: true,
      description: "Need premium quality onions for daily vada pav preparation",
    },
    {
      id: 2,
      title: "Red Chili Powder - 25 kg bulk",
      vendor: "South Indian Tiffin Center",
      location: "Bangalore",
      currentBid: 180,
      startingBid: 220,
      unit: "per kg",
      timeLeft: "1h 42m",
      totalBids: 8,
      leadingBidder: "Spice Valley Traders",
      category: "spices",
      urgent: false,
      verified: true,
      description: "High quality red chili powder for sambar and chutneys",
    },
    {
      id: 3,
      title: "Sunflower Oil - 50 Liter Cans",
      vendor: "Delhi Street Food Junction",
      location: "Chandni Chowk, Delhi",
      currentBid: 145,
      startingBid: 160,
      unit: "per liter",
      timeLeft: "4h 33m",
      totalBids: 15,
      leadingBidder: "Golden Oil Distributors",
      category: "oil",
      urgent: true,
      verified: true,
      description: "For deep frying snacks - need consistent quality",
    },
    {
      id: 4,
      title: "Basmati Rice - 100 kg",
      vendor: "Kolkata Biryani Express",
      location: "Park Street, Kolkata",
      currentBid: 85,
      startingBid: 95,
      unit: "per kg",
      timeLeft: "6h 20m",
      totalBids: 6,
      leadingBidder: "Bengal Rice Mills",
      category: "grains",
      urgent: false,
      verified: true,
      description: "Premium basmati for authentic biryani preparation",
    },
    {
      id: 5,
      title: "Disposable Food Containers - 1000 pcs",
      vendor: "Chennai Dosa Corner",
      location: "T. Nagar, Chennai",
      currentBid: 3.5,
      startingBid: 4.2,
      unit: "per piece",
      timeLeft: "30m",
      totalBids: 23,
      leadingBidder: "EcoPack Solutions",
      category: "packaging",
      urgent: true,
      verified: true,
      description: "Eco-friendly containers for takeaway orders",
    },
    {
      id: 6,
      title: "Mixed Vegetables Bundle",
      vendor: "Pune Street Food Alliance",
      location: "FC Road, Pune",
      currentBid: 45,
      startingBid: 55,
      unit: "per kg",
      timeLeft: "3h 45m",
      totalBids: 9,
      leadingBidder: "Farm Fresh Suppliers",
      category: "vegetables",
      urgent: false,
      verified: true,
      description: "Daily fresh vegetables for pav bhaji and other items",
    },
  ]

  // Function to process API data
  const processApiData = (apiData: ApiAuction[]): ProcessedAuction[] => {
    const vendorNames = [
      "Mumbai Vada Pav Corner",
      "South Indian Tiffin Center",
      "Delhi Street Food Junction",
      "Kolkata Biryani Express",
      "Chennai Dosa Corner",
      "Pune Street Food Alliance",
      "Bangalore Dosa Hub",
      "Hyderabad Biryani House",
      "Jaipur Kachori Corner",
    ]

    const locations = [
      "Dadar, Mumbai",
      "Bangalore",
      "Chandni Chowk, Delhi",
      "Park Street, Kolkata",
      "T. Nagar, Chennai",
      "FC Road, Pune",
      "Koramangala, Bangalore",
      "Banjara Hills, Hyderabad",
      "Pink City, Jaipur",
    ]

    const leadingBidders = [
      "Wholesale Veggie Hub",
      "Spice Valley Traders",
      "Golden Oil Distributors",
      "Bengal Rice Mills",
      "EcoPack Solutions",
      "Farm Fresh Suppliers",
      "Quality Spice Co.",
      "Premium Oil Traders",
      "Green Packaging Ltd.",
    ]

    return apiData.map((item, index) => ({
      id: item.orderId,
      title: item.title,
      vendor: vendorNames[index % vendorNames.length],
      location: item.deliveryLocation || locations[index % locations.length],
      currentBid: item.currentPrice,
      startingBid: item.startingBid,
      unit: item.unit,
      timeLeft: item.auctionDuration || `${Math.floor(Math.random() * 8) + 1}h ${Math.floor(Math.random() * 60)}m`,
      totalBids: item.bids,
      leadingBidder: item.leadingBid || leadingBidders[index % leadingBidders.length],
      category: item.category.toLowerCase(),
      urgent: Boolean(item.urgent),
      verified: true,
      description: item.qualitySpecs || `High quality ${item.title.toLowerCase()} for street food preparation`,
    }))
  }

  // Fetch auctions from API
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:3001/api/auctions")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const apiData: ApiAuction[] = await response.json()

      if (apiData && apiData.length > 0) {
        const processedData = processApiData(apiData)
        setAuctions(processedData)
        console.log("✅ Successfully fetched and processed API data:", processedData)
      } else {
        throw new Error("No auction data received from API")
      }
    } catch (err) {
      console.error("❌ API fetch failed:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch auctions")

      // Fallback to dummy data
      const dummyData = createDummyAuctions()
      setAuctions(dummyData)
      console.log("🔄 Using dummy data as fallback:", dummyData)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchAuctions()
  }, [fetchAuctions])

  // Handle navigation scroll with null check
  const handleNavScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  // Updated categories for street food vendors
  const categories = [
    { id: "all", name: "All Auctions", icon: "🎯", count: `${auctions.length}+` },
    {
      id: "vegetables",
      name: "Fresh Vegetables",
      icon: "🥬",
      count: `${auctions.filter((a) => a.category === "vegetables").length}+`,
    },
    {
      id: "spices",
      name: "Spices & Masalas",
      icon: "🌶",
      count: `${auctions.filter((a) => a.category === "spices").length}+`,
    },
    { id: "oil", name: "Cooking Oil", icon: "🫒", count: `${auctions.filter((a) => a.category === "oil").length}+` },
    {
      id: "grains",
      name: "Rice & Grains",
      icon: "🌾",
      count: `${auctions.filter((a) => a.category === "grains").length}+`,
    },
    {
      id: "packaging",
      name: "Packaging Materials",
      icon: "📦",
      count: `${auctions.filter((a) => a.category === "packaging").length}+`,
    },
  ]

  const toggleSaved = (id: number) => {
    setSavedAuctions((prev) => (prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]))
  }

  const watchAuction = () => {
    setWatchedAuctions((prev) => prev + 1)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Welcome to Rawmart! You'll now receive alerts for the best wholesale deals in your area.")
    setEmail("")
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Header Styles */
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 4rem;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }
        .logo-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tagline {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: -0.25rem;
        }
        .nav {
          display: none;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
        }
        .nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
          padding: 0.5rem;
          border-radius: 0.375rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-link:hover {
          color: #10b981;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .watch-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
        }
        .watch-btn:hover {
          background: rgba(16, 185, 129, 0.1);
        }
        .watch-badge {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: #10b981;
          color: white;
          font-size: 0.75rem;
          border-radius: 50%;
          width: 1.25rem;
          height: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .menu-btn {
          display: block;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
        }
        @media (min-width: 768px) {
          .menu-btn {
            display: none;
          }
        }
        .mobile-menu {
          display: ${isMenuOpen ? "block" : "none"};
          padding: 1rem 0;
          border-top: 1px solid #e5e7eb;
        }
        @media (min-width: 768px) {
          .mobile-menu {
            display: none;
          }
        }
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .mobile-nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          padding: 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .mobile-nav-link:hover {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        /* Problem Statement Section */
        .problem-section {
          background: #10b981;
          color: white;
          padding: 3rem 0;
          text-align: center;
        }
        .problem-card {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          backdrop-filter: blur(4px);
          border-radius: 1rem;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .problem-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .problem-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }
        .problem-stat {
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
        }

        /* Solution Hero */
        .hero {
          position: relative;
          padding: 5rem 0;
          text-align: center;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
        }
        .hero-content {
          position: relative;
          z-index: 1;
        }
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }
        @media (min-width: 768px) {
          .hero-title {
            font-size: 4rem;
          }
        }
        .hero-gradient {
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: #4b5563;
          margin-bottom: 3rem;
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .hero-subtitle {
            font-size: 1.25rem;
          }
        }
        .solution-points {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .solution-point {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          padding: 1.5rem;
          border-radius: 0.75rem;
          border-left: 4px solid #10b981;
        }
        .cta-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          margin: 3rem 0;
        }
        @media (min-width: 640px) {
          .cta-buttons {
            flex-direction: row;
          }
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          color: #111827;
          padding: 1rem 2rem;
          border: 2px solid #10b981;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          background: #10b981;
          color: white;
        }

        /* Stats Section */
        .stats {
          padding: 4rem 0;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .stat-item {
          text-align: center;
          transition: transform 0.3s ease;
        }
        .stat-item:hover {
          transform: scale(1.05);
        }
        .stat-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          transition: box-shadow 0.3s ease;
        }
        .stat-item:hover .stat-icon {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          color: #4b5563;
          font-weight: 500;
        }

        /* Categories Section */
        .categories {
          padding: 4rem 0;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(4px);
        }
        .section-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 640px) {
          .section-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .section-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
        }
        .section-subtitle {
          color: #4b5563;
          margin-top: 0.5rem;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
        .category-btn {
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        .category-btn.active {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-color: transparent;
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .category-btn:not(.active):hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #10b981;
        }
        .category-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        .category-name {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .category-count {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        /* Loading and Error States */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem 0;
          flex-direction: column;
          gap: 1rem;
        }
        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error-container {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid #ef4444;
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
          margin: 2rem 0;
        }
        .error-title {
          color: #ef4444;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .error-message {
          color: #7f1d1d;
          margin-bottom: 1rem;
        }
        .retry-btn {
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        /* Auctions Section */
        .auctions {
          padding: 4rem 0;
        }
        .auctions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .auctions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .auctions-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .auction-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .auction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: #10b981;
        }
        .auction-header {
          position: relative;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        }
        .auction-badges {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }
        .badge-urgent { background: #ef4444; }
        .badge-verified { background: #10b981; }
        .save-btn {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .save-btn.active {
          background: #10b981;
          color: white;
        }
        .save-btn:not(.active) {
          background: rgba(255, 255, 255, 0.8);
          color: #4b5563;
        }
        .auction-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .vendor-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }
        .location {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .auction-content {
          padding: 1.5rem;
        }
        .auction-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .bidding-info {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-left: 4px solid #10b981;
        }
        .bid-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .bid-count {
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
        }
        .time-left {
          font-size: 0.875rem;
          font-weight: 600;
          color: #dc2626;
        }
        .leading-bidder {
          font-size: 0.75rem;
          color: #4b5563;
        }
        .price-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .price-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .current-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
        }
        .starting-price {
          font-size: 0.875rem;
          color: #9ca3af;
          text-decoration: line-through;
        }
        .price-unit {
          font-size: 0.875rem;
          color: #4b5563;
          text-align: right;
        }
        .savings {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .watch-auction-btn {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .watch-auction-btn:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        /* How It Works Section */
        .how-it-works {
          padding: 4rem 0;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
        }
        .steps-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .steps-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .step-item {
          text-align: center;
          position: relative;
        }
        .step-number {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 auto 1rem;
        }
        .step-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .step-description {
          color: #4b5563;
          line-height: 1.6;
        }
        @media (min-width: 768px) {
          .step-item:not(:last-child)::after {
            content: '→';
            position: absolute;
            top: 1.5rem;
            right: -1rem;
            font-size: 1.5rem;
            color: #10b981;
            font-weight: 700;
          }
        }

        /* Success Stories */
        .success-stories {
          padding: 4rem 0;
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .testimonials-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .testimonial-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          border-radius: 1rem;
          padding: 2rem;
          color: white;
          transition: transform 0.3s ease;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
        }
        .testimonial-text {
          font-style: italic;
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .testimonial-author {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .testimonial-location {
          opacity: 0.8;
          font-size: 0.875rem;
        }
        .testimonial-savings {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
          text-align: center;
          font-weight: 600;
        }

        /* Newsletter Section */
        .newsletter {
          padding: 4rem 0;
          background: linear-gradient(135deg, #1f2937, #111827);
        }
        .newsletter-content {
          max-width: 64rem;
          margin: 0 auto;
          text-align: center;
        }
        .newsletter-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          border-radius: 1.5rem;
          padding: 2rem;
        }
        @media (min-width: 768px) {
          .newsletter-card {
            padding: 3rem;
          }
        }
        .newsletter-icon {
          width: 4rem;
          height: 4rem;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        }
        .newsletter-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .newsletter-title {
            font-size: 1.875rem;
          }
        }
        .newsletter-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          margin-bottom: 2rem;
          max-width: 32rem;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .newsletter-subtitle {
            font-size: 1.125rem;
          }
        }
        .newsletter-form {
          max-width: 28rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .newsletter-form {
            flex-direction: row;
          }
        }
        .newsletter-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1rem;
        }
        .newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        .newsletter-input:focus {
          outline: none;
          border-color: #10b981;
        }
        .newsletter-btn {
          background: #10b981;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .newsletter-btn:hover {
          background: #059669;
        }
        .newsletter-disclaimer {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        /* Footer */
        .footer {
          background: #111827;
          color: white;
          padding: 3rem 0;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .footer-content {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .footer-logo {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .footer-brand-text {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .footer-description {
          color: #9ca3af;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .footer-section-title {
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .footer-links {
          list-style: none;
        }
        .footer-links li {
          margin-bottom: 0.5rem;
        }
        .footer-link {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .footer-link:hover {
          color: #10b981;
        }
        .footer-bottom {
          border-top: 1px solid #374151;
          margin-top: 3rem;
          padding-top: 2rem;
          text-align: center;
          color: #9ca3af;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
      <div>
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-content">
              <a href="#" className="logo">
                <div className="logo-icon">🎯</div>
                <div>
                  <h1 className="logo-text">Rawmart</h1>
                  <div className="tagline">Street Vendor Supply Solution</div>
                </div>
              </a>
              <nav className="nav">
                <button className="nav-link" onClick={() => handleNavScroll(problemRef)}>
                  Problem
                </button>
                <button className="nav-link" onClick={() => handleNavScroll(solutionRef)}>
                  Solution
                </button>
                <button className="nav-link" onClick={() => handleNavScroll(auctionsRef)}>
                  Live Auctions
                </button>
                <button className="nav-link" onClick={() => handleNavScroll(howItWorksRef)}>
                  How It Works
                </button>
              </nav>
              <div className="header-actions">
                <button className="watch-btn">
                  👁{watchedAuctions > 0 && <span className="watch-badge">{watchedAuctions}</span>}
                </button>
                <button className="btn-primary" onClick={() => router.push("/login")}>
                  Get Started
                </button>
                <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? "✕" : "☰"}
                </button>
              </div>
            </div>
            {/* Mobile Menu */}
            <div className="mobile-menu">
              <nav className="mobile-nav">
                <button className="mobile-nav-link" onClick={() => handleNavScroll(problemRef)}>
                  🚨 The Problem
                </button>
                <button className="mobile-nav-link" onClick={() => handleNavScroll(solutionRef)}>
                  💡 Our Solution
                </button>
                <button className="mobile-nav-link" onClick={() => handleNavScroll(auctionsRef)}>
                  🎯 Live Auctions
                </button>
                <button className="mobile-nav-link" onClick={() => handleNavScroll(howItWorksRef)}>
                  ⚙ How It Works
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Problem Statement Section */}
        <section id="problem" className="problem-section" ref={problemRef}>
          <div className="container">
            <div className="problem-card">
              <h2 className="problem-title">🚨 The Critical Problem</h2>
              <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
                Street food vendors across India struggle with <strong>inefficient raw material procurement</strong>,
                leading to high costs, poor quality supplies, and reduced profitability.
              </p>
              <div className="problem-stats">
                <div className="problem-stat">
                  <div className="stat-number">40-60%</div>
                  <div>of vendor costs are raw materials</div>
                </div>
                <div className="problem-stat">
                  <div className="stat-number">₹2.8L Cr</div>
                  <div>Street food market size in India</div>
                </div>
                <div className="problem-stat">
                  <div className="stat-number">25-30%</div>
                  <div>Potential savings through better procurement</div>
                </div>
                <div className="problem-stat">
                  <div className="stat-number">4M+</div>
                  <div>Street food vendors nationwide</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Hero */}
        <section id="solution" className="hero" ref={solutionRef}>
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                <span className="hero-gradient">Rawmart</span>
                <br />
                Reverse Auction Platform
              </h1>
              <p className="hero-subtitle">
                Revolutionary bidding platform where street food vendors post their requirements and wholesalers compete
                with their best prices.
                <strong> Lowest bid wins, everyone saves!</strong>
              </p>

              <div className="solution-points">
                <div className="solution-point">
                  <h3>🎯 Reverse Bidding</h3>
                  <p>Vendors announce needs, suppliers compete with lower prices</p>
                </div>
                <div className="solution-point">
                  <h3>💰 Cost Reduction</h3>
                  <p>Save 25-40% on raw material costs through competition</p>
                </div>
                <div className="solution-point">
                  <h3>📱 Mobile-First</h3>
                  <p>Simple app designed for street vendors&apos; daily workflow</p>
                </div>
              </div>
              <div className="cta-buttons">
                <button className="btn-primary" style={{ fontSize: "1.25rem", padding: "1rem 2rem" }}>
                  🚀 View Live Demo
                </button>
                <button
  className="btn-secondary"
  onClick={() => router.push("/team")}
>
  📊 See Team Members
</button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Quiz Section */}
        <section
          className="quiz-section"
          style={{
            padding: "4rem 0",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="container">
            <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 className="section-title">🎮 Vendor Assessment Tool</h2>
              <p className="section-subtitle">
                Take our quick assessment to see how much you could save with Rawmart
              </p>
            </div>
            <VendorQuizComponent />
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 className="section-title">Expected Impact</h2>
              <p className="section-subtitle">Projected results from our pilot program</p>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">💰</div>
                <div className="stat-value">30%</div>
                <div className="stat-label">Average Cost Savings</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⏱</div>
                <div className="stat-value">75%</div>
                <div className="stat-label">Time Saved in Procurement</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📈</div>
                <div className="stat-value">45%</div>
                <div className="stat-label">Profit Margin Increase</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🤝</div>
                <div className="stat-value">5x</div>
                <div className="stat-label">More Supplier Options</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Browse by Category</h2>
                <p className="section-subtitle">Find auctions for your specific needs</p>
              </div>
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "2px solid #e5e7eb",
                  width: "100%",
                  maxWidth: "300px",
                }}
              />
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-name">{category.name}</div>
                  <div className="category-count">{category.count} auctions</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Auctions Section */}
        <section id="auctions" className="auctions" ref={auctionsRef}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">🔥 Live Auction Demo</h2>
                <p className="section-subtitle">
                  {error
                    ? "Demo data - Real-time bidding wars happening now!"
                    : "Real-time bidding wars happening now - watch prices drop!"}
                </p>
              </div>
              {error && (
                <button className="retry-btn" onClick={fetchAuctions} style={{ marginLeft: "auto" }}>
                  🔄 Retry API
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading live auctions...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="error-container">
                <h3 className="error-title">⚠️ API Connection Issue</h3>
                <p className="error-message">{error}. Showing demo data instead.</p>
                <button className="retry-btn" onClick={fetchAuctions}>
                  🔄 Try Again
                </button>
              </div>
            )}

            {/* Auctions Grid */}
            {!loading && (
              <div className="auctions-grid">
                {auctions
                  .filter(
                    (auction) =>
                      (selectedCategory === "all" || auction.category === selectedCategory) &&
                      (searchQuery === "" || auction.title.toLowerCase().includes(searchQuery.toLowerCase())),
                  )
                  .map((auction) => (
                    <div key={auction.id} className="auction-card">
                      <div className="auction-header">
                        <div className="auction-badges">
                          {auction.urgent && <span className="badge badge-urgent">🚨 URGENT</span>}
                          {auction.verified && <span className="badge badge-verified">✅ VERIFIED</span>}
                        </div>
                        <button
                          className={`save-btn ${savedAuctions.includes(auction.id) ? "active" : ""}`}
                          onClick={() => toggleSaved(auction.id)}
                        >
                          {savedAuctions.includes(auction.id) ? "💾" : "🔖"}
                        </button>
                        <h3 className="auction-title">{auction.title}</h3>
                        <div className="vendor-info">
                          <span>🏪 {auction.vendor}</span>
                        </div>
                        <div className="location">📍 {auction.location}</div>
                      </div>
                      <div className="auction-content">
                        <p className="auction-description">{auction.description}</p>
                        <div className="bidding-info">
                          <div className="bid-stats">
                            <span className="bid-count">🎯 {auction.totalBids} bids received</span>
                            <span className="time-left">⏰ {auction.timeLeft} left</span>
                          </div>
                          <div className="leading-bidder">🏆 Leading: {auction.leadingBidder}</div>
                        </div>
                        <div className="price-container">
                          <div className="price-group">
                            <div className="current-price">₹{auction.currentBid}</div>
                            <div className="starting-price">was ₹{auction.startingBid}</div>
                          </div>
                          <div>
                            <div className="price-unit">{auction.unit}</div>
                            <div className="savings">
                              {Math.round(((auction.startingBid - auction.currentBid) / auction.startingBid) * 100)}%
                              OFF
                            </div>
                          </div>
                        </div>
                        <button className="watch-auction-btn" onClick={watchAuction}>
                          👁 Watch Live Bidding
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works" ref={howItWorksRef}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 className="section-title">How Rawmart Works</h2>
              <p className="section-subtitle">Simple 3-step process to revolutionize your supply chain</p>
            </div>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <h3 className="step-title">Vendor Posts Request</h3>
                <p className="step-description">
                  Street food vendor creates auction listing with specific requirements: quantity, quality specs,
                  delivery location, and deadline.
                </p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h3 className="step-title">Wholesalers Compete</h3>
                <p className="step-description">
                  Multiple verified wholesalers bid against each other, driving prices down while maintaining quality
                  standards.
                </p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h3 className="step-title">Best Price Wins</h3>
                <p className="step-description">
                  Lowest qualifying bid wins the contract. Direct connection, transparent pricing, guaranteed savings
                  for the vendor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="success-stories">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 className="section-title" style={{ color: "white" }}>
                Success Stories from Pilot Program
              </h2>
              <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>
                Real vendors, real savings, real impact
              </p>
            </div>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <p className="testimonial-text">
                  &quot;Rawmart changed my business completely! I now save ₹8,000 monthly on vegetables alone. The
                  competitive bidding ensures I always get the freshest produce at the best price.&quot;
                </p>
                <div className="testimonial-author">Ramesh Kumar</div>
                <div className="testimonial-location">Pav Bhaji Stall, Mumbai</div>
                <div className="testimonial-savings">Monthly Savings: ₹12,000</div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  &quot;As a wholesaler, Rawmart gave me direct access to hundreds of street vendors. My sales increased by
                  60% and I can offer better prices due to higher volumes.&quot;
                </p>
                <div className="testimonial-author">Priya Wholesales</div>
                <div className="testimonial-location">Spice Distributor, Delhi</div>
                <div className="testimonial-savings">Revenue Growth: 60%</div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  &quot;The platform is so easy to use! I post my requirements in the morning and by afternoon I have 5-6
                  competitive bids. My profit margins improved by 35%.&quot;
                </p>
                <div className="testimonial-author">Lakshmi Devi</div>
                <div className="testimonial-location">South Indian Tiffin, Bangalore</div>
                <div className="testimonial-savings">Profit Increase: 35%</div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter/Contact Section */}
        <section className="newsletter">
          <div className="container">
            <div className="newsletter-content">
              <div className="newsletter-card">
                <div className="newsletter-icon">🚀</div>
                <h2 className="newsletter-title">Ready to Revolutionize Your Supply Chain?</h2>
                <p className="newsletter-subtitle">
                  Join our pilot program and be among the first vendors to experience 30%+ savings on raw materials.
                  Limited spots available!
                </p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Enter your email for pilot program access"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    🎯 Join Pilot Program
                  </button>
                </form>
                <p className="newsletter-disclaimer">
                  Free pilot program • No commitment required • Start saving immediately
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div>
                <div className="footer-brand">
                  <div className="footer-logo">🎯</div>
                  <h3 className="footer-brand-text">Rawmart</h3>
                </div>
                <p className="footer-description">
                  Hackathon Project: Solving street food vendor supply chain challenges through innovative reverse
                  bidding technology. Built for vendors, by problem solvers.
                </p>
              </div>
              <div>
                <h4 className="footer-section-title">Solution Features</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      Reverse Auction System
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Mobile-First Design
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Vendor Verification
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Real-time Bidding
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="footer-section-title">Business Impact</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      Cost Reduction Model
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Market Analysis
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Revenue Projections
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Scalability Plan
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="footer-section-title">Hackathon Team</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      Problem Statement
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Technical Architecture
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Business Presentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Demo Video
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2025 Rawmart - Hackathon Solution for Street Vendor Supply Chain Optimization</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
