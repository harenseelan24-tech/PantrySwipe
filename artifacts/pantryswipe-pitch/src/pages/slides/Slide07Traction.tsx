export default function Slide07Traction() {
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
      }}
    >
      {/* Saffron glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          transform: "translate(-50%, -50%)",
          width: "70vw",
          height: "70vw",
          background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, rgba(79,70,229,0.08) 40%, rgba(5,5,5,0) 70%)",
          zIndex: 1,
          filter: "blur(90px)",
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
          Traction
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: "15vh",
          left: "7vw",
          right: "7vw",
          bottom: "10vh",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            fontSize: "4.5vw",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "#F0EDE8",
          }}
        >
          Production-ready.
          <span style={{ color: "#F5A623" }}> Paywall ready.</span>
        </h2>

        <p
          style={{
            fontSize: "1.2vw",
            fontWeight: 300,
            color: "#6b7280",
            marginTop: "1.5vh",
            marginBottom: "5vh",
          }}
        >
          Built on Expo SDK 54 — deployed on iOS and Android today.
        </p>

        {/* Traction items — 2x2 grid */}
        <div
          style={{
            display: "flex",
            gap: "3vw",
            flex: 1,
          }}
        >
          {/* Left column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
            <div style={{ borderTop: "2px solid #F5A623", paddingTop: "2.5vh" }}>
              <div
                style={{
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0EDE8",
                  marginBottom: "1vh",
                  letterSpacing: "-0.01em",
                }}
              >
                8 core features shipped
              </div>
              <div
                style={{
                  fontSize: "1.1vw",
                  fontWeight: 300,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                Swipe deck, Pantry AI, Meal Planner, Cook Mode, AI Chef, Social Feed, Party Planner, Gamification
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2.5vh" }}>
              <div
                style={{
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0EDE8",
                  marginBottom: "1vh",
                  letterSpacing: "-0.01em",
                }}
              >
                RevenueCat IAP live
              </div>
              <div
                style={{
                  fontSize: "1.1vw",
                  fontWeight: 300,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                In-app purchase integration in place. Subscription paywall ready to activate on day one.
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
            <div style={{ borderTop: "2px solid #4CAF76", paddingTop: "2.5vh" }}>
              <div
                style={{
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0EDE8",
                  marginBottom: "1vh",
                  letterSpacing: "-0.01em",
                }}
              >
                Full design system
              </div>
              <div
                style={{
                  fontSize: "1.1vw",
                  fontWeight: 300,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                Dark + light themes, saffron brand palette, liquid glass iOS 26 nav, custom gesture system.
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2.5vh" }}>
              <div
                style={{
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0EDE8",
                  marginBottom: "1vh",
                  letterSpacing: "-0.01em",
                }}
              >
                Seeking: CTO-level co-founder
              </div>
              <div
                style={{
                  fontSize: "1.1vw",
                  fontWeight: 300,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                To own backend infrastructure, ML pipeline, and scale to production users.
              </div>
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
        07
      </div>
    </div>
  );
}
