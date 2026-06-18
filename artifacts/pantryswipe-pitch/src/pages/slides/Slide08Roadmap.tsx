export default function Slide08Roadmap() {
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
      {/* Purple glow — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "65vw",
          height: "65vw",
          background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(5,5,5,0) 65%)",
          zIndex: 1,
          filter: "blur(80px)",
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
          What We're Building Next
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
            fontSize: "4vw",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "#F0EDE8",
          }}
        >
          Technical roadmap for the co-founder
        </h2>

        <p
          style={{
            fontSize: "1.2vw",
            fontWeight: 300,
            color: "#6b7280",
            marginTop: "1.5vh",
            marginBottom: "4vh",
          }}
        >
          These are the engineering challenges that will define the product's competitive moat.
        </p>

        {/* Numbered roadmap items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh", flex: 1, justifyContent: "center" }}>
          {/* Item 1 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw" }}>
            <div
              style={{
                fontSize: "3vw",
                fontWeight: 900,
                color: "#F5A623",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                width: "3.5vw",
                flexShrink: 0,
                marginTop: "-0.2vh",
              }}
            >
              01
            </div>
            <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5vh" }}>
              <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#F0EDE8", marginBottom: "0.6vh" }}>
                Computer vision pantry scanner
              </div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#6b7280" }}>
                Photograph your fridge → AI detects and logs ingredients automatically
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw" }}>
            <div
              style={{
                fontSize: "3vw",
                fontWeight: 900,
                color: "#4CAF76",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                width: "3.5vw",
                flexShrink: 0,
                marginTop: "-0.2vh",
              }}
            >
              02
            </div>
            <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5vh" }}>
              <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#F0EDE8", marginBottom: "0.6vh" }}>
                Receipt OCR for grocery import
              </div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#6b7280" }}>
                Photograph a grocery receipt → auto-populate pantry with quantities and expiry dates
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw" }}>
            <div
              style={{
                fontSize: "3vw",
                fontWeight: 900,
                color: "#F5A623",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                width: "3.5vw",
                flexShrink: 0,
                marginTop: "-0.2vh",
              }}
            >
              03
            </div>
            <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5vh" }}>
              <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#F0EDE8", marginBottom: "0.6vh" }}>
                Personalised ML recipe ranking
              </div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#6b7280" }}>
                Model trained on swipe history, dietary preferences, and cooking frequency
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw" }}>
            <div
              style={{
                fontSize: "3vw",
                fontWeight: 900,
                color: "#4CAF76",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                width: "3.5vw",
                flexShrink: 0,
                marginTop: "-0.2vh",
              }}
            >
              04
            </div>
            <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5vh" }}>
              <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#F0EDE8", marginBottom: "0.6vh" }}>
                Backend API + push notification engine
              </div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#6b7280" }}>
                PostgreSQL data layer, expiry alerts, social feed real-time sync
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
        08
      </div>
    </div>
  );
}
