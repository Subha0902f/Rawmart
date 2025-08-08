"use client"

export default function MemberContributions() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem 1rem",
      }}
    >
      {/* Header */} 
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #166534, #22c55e, #16a34a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Team Contributions
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#166534",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Meet our amazing team members and discover their valuable contributions to our project
        </p>
      </div>

      {/* Team Leader Section */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto 4rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f8fafc)",
            borderRadius: "25px",
            padding: "1.5rem",
            boxShadow: "0 15px 40px rgba(34, 197, 94, 0.15), 0 5px 15px rgba(34, 197, 94, 0.25)",
            border: "3px solid #22c55e",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)"
            e.currentTarget.style.boxShadow = "0 25px 50px rgba(34, 197, 94, 0.2), 0 10px 20px rgba(34, 197, 94, 0.3)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(34, 197, 94, 0.15), 0 5px 15px rgba(34, 197, 94, 0.25)"
          }}
        >
          {/* Leader Badge */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(34, 197, 94, 0.3)",
            }}
          >
            TEAM LEADER
          </div>

          {/* Decorative Elements */}
          <div
            style={{
              position: "absolute",
              top: "-75px",
              left: "-75px",
              width: "150px",
              height: "150px",
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              opacity: "0.08",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: "-75px",
              right: "-75px",
              width: "150px",
              height: "150px",
              background: "linear-gradient(45deg, #16a34a, #15803d)",
              borderRadius: "50%",
              opacity: "0.08",
            }}
          ></div>

          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "#166534",
              marginBottom: "0.5rem",
            }}
          >
           Subhadeep Bose
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#22c55e",
              fontWeight: "600",
              marginBottom: "1.2rem",
            }}
          >
            Project Lead & Senior Developer
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <a href="https://www.linkedin.com/in/subhadeep-bose-120037270?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" style={{ color: "#22c55e", textDecoration: "underline" }}>Linkedin Account</a>
            <a href="https://github.com/Subha0902f" style={{ color: "#22c55e", textDecoration: "underline" }}>Github Account</a>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              borderRadius: "15px",
              padding: "1.2rem",
              border: "2px solid #bbf7d0",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#15803d",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              ></span>
              Leadership & Technical Contributions
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                color: "#166534",
                lineHeight: "1.8",
              }}
            >
              <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                <li style={{ marginBottom: "0.7rem" }}>• Project Architecture & Planning</li>
                <li style={{ marginBottom: "0.7rem" }}>• Team Coordination & Management</li>
                <li style={{ marginBottom: "0.7rem" }}>• Frontend Architecture & Design System</li>
                <li style={{ marginBottom: "0.7rem" }}>• Code Review & Quality Assurance</li>
              </ul>
              <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                <li style={{ marginBottom: "0.7rem" }}>• React Component Library Development</li>
                <li style={{ marginBottom: "0.7rem" }}>• User Interface Optimization</li>
                <li style={{ marginBottom: "0.7rem" }}>• Cross-browser Compatibility Testing</li>
                <li style={{ marginBottom: "0.7rem" }}>• Technical Documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#166534",
            marginBottom: "1rem",
          }}
        >
          Team Members
        </h2>
        <div
          style={{
            width: "80px",
            height: "4px",
            background: "linear-gradient(45deg, #22c55e, #16a34a)",
            margin: "0 auto",
            borderRadius: "2px",
          }}
        ></div>
      </div>

      {/* Members Grid - Single Line */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        {/* Member 2 - Ayushi Kundu */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f8fafc)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)",
            border: "2px solid #bbf7d0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            position: "relative",
            overflow: "hidden",
            minWidth: "250px",
            flex: "1",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)"
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(34, 197, 94, 0.15), 0 1px 8px rgba(34, 197, 94, 0.3)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              opacity: "0.1",
            }}
          ></div>

          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#166534",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            Ayushi Kundu
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <a href="https://github.com/ayushikundu5" style={{ color: "#22c55e", textDecoration: "underline" }}>Github Account</a>
            <a href="https://www.linkedin.com/in/ayushikundu" style={{ color: "#22c55e", textDecoration: "underline" }}>Linkedin Account</a>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#15803d",
                marginBottom: "0.8rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  marginRight: "6px",
                }}
              ></span>
              Contributions
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "0",
                color: "#166534",
                lineHeight: "1.6",
                fontSize: "0.9rem",
              }}
            >
              <li style={{ marginBottom: "0.4rem" }}>• Backend API Development</li>
              <li style={{ marginBottom: "0.4rem" }}>• Database Schema Design</li>
              <li style={{ marginBottom: "0.4rem" }}>• Authentication & Security</li>
              <li style={{ marginBottom: "0.4rem" }}>• Performance Optimization</li>
            </ul>
          </div>
        </div>

        {/* Member 3 - Souvik Saha */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f8fafc)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)",
            border: "2px solid #bbf7d0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            position: "relative",
            overflow: "hidden",
            minWidth: "250px",
            flex: "1",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)"
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(34, 197, 94, 0.15), 0 1px 8px rgba(34, 197, 94, 0.3)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              opacity: "0.1",
            }}
          ></div>

          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#166534",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            Souvik Saha
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <a href="https://github.com/Souv05" style={{ color: "#22c55e", textDecoration: "underline" }}>Github Account</a>
            <a href="https://www.linkedin.com/in/souviksaha05/" style={{ color: "#22c55e", textDecoration: "underline" }}>Linkedin Account</a>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#15803d",
                marginBottom: "0.8rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  marginRight: "6px",
                }}
              ></span>
              Contributions
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "0",
                color: "#166534",
                lineHeight: "1.6",
                fontSize: "0.9rem",
              }}
            >
              <li style={{ marginBottom: "0.4rem" }}>• DevOps & CI/CD Pipeline Setup</li>
              <li style={{ marginBottom: "0.4rem" }}>• Cloud Infrastructure Management</li>
              <li style={{ marginBottom: "0.4rem" }}>• Monitoring & Logging Systems</li>
              <li style={{ marginBottom: "0.4rem" }}>• Deployment Automation</li>
            </ul>
          </div>
        </div>

        {/* Member 4 - Tathagata Sengupta */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f8fafc)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)",
            border: "2px solid #bbf7d0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            position: "relative",
            overflow: "hidden",
            minWidth: "250px",
            flex: "1",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)"
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(34, 197, 94, 0.15), 0 1px 8px rgba(34, 197, 94, 0.3)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              opacity: "0.1",
            }}
          ></div>

          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#166534",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
          Tathagata Sengupta 
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <a href="https://github.com/Babanstar456" style={{ color: "#22c55e", textDecoration: "underline" }}>Github Account</a>
            <a href="https://in.linkedin.com/in/tathagata-sengupta-546362140" style={{ color: "#22c55e", textDecoration: "underline" }}>Linkedin Account</a>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#15803d",
                marginBottom: "0.8rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  marginRight: "6px",
                }}
              ></span>
              Contributions
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "0",
                color: "#166534",
                lineHeight: "1.6",
                fontSize: "0.9rem",
              }}
            >
              <li style={{ marginBottom: "0.4rem" }}>• UX/UI Design & Prototyping</li>
              <li style={{ marginBottom: "0.4rem" }}>• User Research & Testing</li>
              <li style={{ marginBottom: "0.4rem" }}>• Design System Documentation</li>
              <li style={{ marginBottom: "0.4rem" }}>• Accessibility Standards Implementation</li>
            </ul>
          </div>
        </div>

        {/* Member 5 - Kaniz Fatma */}
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff, #f8fafc)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)",
            border: "2px solid #bbf7d0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            position: "relative",
            overflow: "hidden",
            minWidth: "250px",
            flex: "1",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)"
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(34, 197, 94, 0.15), 0 1px 8px rgba(34, 197, 94, 0.3)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(34, 197, 94, 0.1), 0 1px 8px rgba(34, 197, 94, 0.2)"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              opacity: "0.1",
            }}
          ></div>

          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#166534",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            Kaniz Fatma
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <a href="https://github.com/Fatima-learns" style={{ color: "#22c55e", textDecoration: "underline" }}>Github Account</a>
            <a href="https://linkedin.com/in/kaneez-fatima-34b152339" style={{ color: "#22c55e", textDecoration: "underline" }}> Linkedin Account</a>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#15803d",
                marginBottom: "0.8rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  marginRight: "6px",
                }}
              ></span>
              Contributions
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "0",
                color: "#166534",
                lineHeight: "1.6",
                fontSize: "0.9rem",
              }}
            >
              <li style={{ marginBottom: "0.4rem" }}>• Quality Assurance & Testing</li>
              <li style={{ marginBottom: "0.4rm" }}>• Bug Tracking & Resolution</li>
              <li style={{ marginBottom: "0.4rem" }}>• Code Review & Documentation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "4rem",
          padding: "2rem",
          background: "linear-gradient(135deg, #166534, #15803d)",
          borderRadius: "20px",
          color: "white",
          maxWidth: "800px",
          margin: "4rem auto 0",
        }}
      >
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Together We Build Amazing Things
        </h3>
        <p
          style={{
            fontSize: "1.1rem",
            opacity: "0.9",
            lineHeight: "1.6",
          }}
        >
          Our diverse team brings together expertise from different domains to create innovative solutions and deliver
          exceptional results.
        </p>
      </div>
    </div>
  )
}