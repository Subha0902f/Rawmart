"use client"

import React, { useState } from "react"
// Add Firebase imports
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

// Firebase config (reuse your config or import from a shared file)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Interface for form data
interface AuctionFormData {
  title: string
  category: string
  quantity: string
  unit: string
  qualitySpecs: string
  deliveryLocation: string
  auctionDuration: string
  startingBid: string
  urgent: boolean
}

// This page will always show the modal-style form (not as a modal, but as a full page)
const CreateAuctionPanel: React.FC = () => {
  const [formData, setFormData] = useState<AuctionFormData>({
    title: "",
    category: "",
    quantity: "",
    unit: "",
    qualitySpecs: "",
    deliveryLocation: "",
    auctionDuration: "24",
    startingBid: "",
    urgent: false,
  })

  const [errors, setErrors] = useState<Partial<AuctionFormData>>({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<AuctionFormData> = {}
    if (!formData.title) newErrors.title = "Title is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.quantity || isNaN(Number(formData.quantity)))
      newErrors.quantity = "Valid quantity is required"
    if (!formData.unit) newErrors.unit = "Unit is required"
    if (!formData.qualitySpecs) newErrors.qualitySpecs = "Quality specifications are required"
    if (!formData.deliveryLocation) newErrors.deliveryLocation = "Delivery location is required"
    if (!formData.startingBid || isNaN(Number(formData.startingBid)))
      newErrors.startingBid = "Valid starting bid is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Push to Firestore
      await addDoc(collection(db, "auctions"), {
        ...formData,
        quantity: Number(formData.quantity),
        startingBid: Number(formData.startingBid),
        createdAt: Timestamp.now(),
        status: "active",
      })
      setSuccess(true)
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({
          title: "",
          category: "",
          quantity: "",
          unit: "",
          qualitySpecs: "",
          deliveryLocation: "",
          auctionDuration: "24",
          startingBid: "",
          urgent: false,
        })
        setErrors({})
        setSuccess(false)
      }, 2000)
    } catch {
      setErrors({ title: "Failed to create auction. Please try again." })
    }
    setLoading(false)
  }

  return (
    <>
      <style jsx>{`
        .page-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }
        .form-container {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0,0,0,0.12);
          position: relative;
        }
        .form-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .form-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          color: #111827;
          transition: all 0.3s ease;
        }
        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        .error {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .form-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: #10b981;
        }
        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .success-msg {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 0.5rem;
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        @media (max-width: 640px) {
          .form-container {
            padding: 1rem;
          }
          .form-title {
            font-size: 1.15rem;
          }
        }
      `}</style>
      <div className="page-bg">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Create New Auction</h2>
            <p className="form-subtitle">
              Post your raw material requirements and let wholesalers compete with their best prices!
            </p>
          </div>
          {success && (
            <div className="success-msg">
              🎉 Auction created successfully!
            </div>
          )}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Auction Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Fresh Onions - 500 kg"
              />
              {errors.title && <div className="error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="vegetables">Fresh Vegetables</option>
                <option value="spices">Spices & Masalas</option>
                <option value="oil">Cooking Oil</option>
                <option value="grains">Rice & Grains</option>
                <option value="packaging">Packaging Materials</option>
              </select>
              {errors.category && <div className="error">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity" className="form-label">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 500"
                min="1"
              />
              {errors.quantity && <div className="error">{errors.quantity}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="unit" className="form-label">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                className="form-select"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">Select Unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="liter">Liter</option>
                <option value="piece">Piece</option>
                <option value="bundle">Bundle</option>
              </select>
              {errors.unit && <div className="error">{errors.unit}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="qualitySpecs" className="form-label">
                Quality Specifications *
              </label>
              <textarea
                id="qualitySpecs"
                name="qualitySpecs"
                className="form-textarea"
                value={formData.qualitySpecs}
                onChange={handleChange}
                placeholder="e.g., Premium quality, no spoilage, medium-sized onions"
              />
              {errors.qualitySpecs && <div className="error">{errors.qualitySpecs}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryLocation" className="form-label">
                Delivery Location *
              </label>
              <input
                type="text"
                id="deliveryLocation"
                name="deliveryLocation"
                className="form-input"
                value={formData.deliveryLocation}
                onChange={handleChange}
                placeholder="e.g., Dadar, Mumbai"
              />
              {errors.deliveryLocation && (
                <div className="error">{errors.deliveryLocation}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="auctionDuration" className="form-label">
                Auction Duration *
              </label>
              <select
                id="auctionDuration"
                name="auctionDuration"
                className="form-select"
                value={formData.auctionDuration}
                onChange={handleChange}
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startingBid" className="form-label">
                Starting Bid (₹) *
              </label>
              <input
                type="number"
                id="startingBid"
                name="startingBid"
                className="form-input"
                value={formData.startingBid}
                onChange={handleChange}
                placeholder="e.g., 35"
                min="0"
                step="0.01"
              />
              {errors.startingBid && <div className="error">{errors.startingBid}</div>}
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="urgent"
                name="urgent"
                className="form-checkbox"
                checked={formData.urgent}
                onChange={handleChange}
              />
              <label htmlFor="urgent" className="form-label" style={{ marginBottom: 0 }}>
                Mark as Urgent (faster bidding)
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "🎯 Create Auction"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateAuctionPanel