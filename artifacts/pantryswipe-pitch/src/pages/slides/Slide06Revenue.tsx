export default function Slide06Revenue() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#050505",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        color: "#F0EDE8",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        display: "flex",
      }}
    >
      {/* Green glow — right side */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-10%",
          transform: "translateY(-50%)",
          width: "55vw",
          height: "55vw",
          background: "radial-gradient(circle, rgba(76,175,118,0.18) 0%, rgba(5,5,5,0) 65%)",
          zIndex: 1,
          filter: "blur(70px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: "4vh",
          left: "5vw",
          right: "5vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: "0.85vw",
            fontWeight: 700,
            color: "#F5A623",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          PantrySwipe
        </span>
        <span
          style={{
            fontSize: "0.85vw",
            fontWeight: 300,
            color: "#6b7280",
            letterSpacing: "0.15em",
          }}
        >
          Revenue Model
        </span>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          zIndex: 3,
          position: "relative",
          paddingTop: "14vh",
          paddingBottom: "10vh",
          paddingLeft: "7vw",
          paddingRight: "7vw",
          boxSizing: "border-box",
          alignItems: "stretch",
          gap: "6vw",
        }}
      >
        {/* Left — primary model */}
        <div style={{ width: "42%", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontSize: "0.85vw",
              fontWeight: 700,
              color: "#F5A623",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "2vh",
            }}
          >
            Primary
          </div>
          <div
            style={{
              fontSize: "5vw",
              fontWeight: 900,
              color: "#F0EDE8",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            SGD 4.99
            <span
              style={{
                fontSize: "1.5vw",
                fontWeight: 300,
                color: "#6b7280",
                letterSpacing: "0",
              }}
            >
              {" "}/ month
            </span>
          </div>
          <div
            style={{
              fontSize: "1.8vw",
              fontWeight: 700,
              color: "#4CAF76",
              marginTop: "1vh",
            }}
          >
            SGD 39.99 / year
          </div>

          <div
            style={{
              width: "3vw",
              height: "2px",
              backgroundColor: "#F5A623",
              marginTop: "3vh",
              marginBottom: "3vh",
            }}
          />

          <div
            style={{
              fontSize: "1vw",
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.7,
            }}
          >
            Unlimited AI Chef queries
          </div>
          <div
            style={{
              fontSize: "1vw",
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.7,
            }}
          >
            Smart expiry alerts
          </div>
          <div
            style={{
              fontSize: "1vw",
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.7,
            }}
          >
            Advanced meal planner + nutrition tracking
          </div>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: "1px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.12) 70%, rgba(255,255,255,0) 100%)",
            flexShrink: 0,
          }}
        />

        {/* Right — additional streams */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "3vh" }}>
          <div
            style={{
              fontSize: "0.85vw",
              fontWeight: 700,
              color: "#4CAF76",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "0.5vh",
            }}
          >
            Additional streams
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2.5vh" }}>
            <div
              style={{
                fontSize: "1.6vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "0.8vh",
              }}
            >
              Grocery affiliate
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#6b7280",
              }}
            >
              SGD 1–3 per order via FairPrice / RedMart API integration
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2.5vh" }}>
            <div
              style={{
                fontSize: "1.6vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "0.8vh",
              }}
            >
              Sponsored recipes
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#6b7280",
              }}
            >
              Native placement for food brands inside the swipe deck
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2.5vh" }}>
            <div
              style={{
                fontSize: "1.6vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "0.8vh",
              }}
            >
              B2B white-label
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#6b7280",
              }}
            >
              Corporate wellness programmes — licensed pantry + meal planner
            </div>
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          boxShadow: "inset 0 0 15vw rgba(0,0,0,0.6)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "4vh",
          left: "5vw",
          fontSize: "0.75vw",
          fontWeight: 300,
          color: "#374151",
          letterSpacing: "0.05em",
          zIndex: 10,
        }}
      >
        PantrySwipe / Confidential
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "4vh",
          right: "5vw",
          fontSize: "0.8vw",
          fontWeight: 300,
          color: "#374151",
          letterSpacing: "0.1em",
          zIndex: 10,
        }}
      >
        06
      </div>
    </div>
  );
}
