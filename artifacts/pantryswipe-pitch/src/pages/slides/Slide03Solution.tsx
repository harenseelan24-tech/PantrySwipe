export default function Slide03Solution() {
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
      {/* Purple glow — upper right */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(5,5,5,0) 65%)",
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
          The Solution
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
            fontSize: "5vw",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#F0EDE8",
          }}
        >
          Tinder for recipes.
          <span style={{ color: "#F5A623" }}> Powered by your pantry.</span>
        </h2>

        <p
          style={{
            fontSize: "1.3vw",
            fontWeight: 300,
            color: "#9ca3af",
            marginTop: "2vh",
            marginBottom: "5vh",
            letterSpacing: "0.02em",
          }}
        >
          A Tinder-style recipe discovery app driven by what's already in your kitchen.
        </p>

        {/* 4 feature blocks */}
        <div
          style={{
            display: "flex",
            gap: "3vw",
            flex: 1,
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              flex: 1,
              borderTop: "2px solid #F5A623",
              paddingTop: "2.5vh",
            }}
          >
            <div
              style={{
                fontSize: "2.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.5vh",
                letterSpacing: "-0.02em",
              }}
            >
              Swipe to decide
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#9ca3af",
                lineHeight: 1.6,
              }}
            >
              Right to cook, left to skip, up to save. Instant intuitive decisions, no browsing.
            </div>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              flex: 1,
              borderTop: "2px solid #4CAF76",
              paddingTop: "2.5vh",
            }}
          >
            <div
              style={{
                fontSize: "2.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.5vh",
                letterSpacing: "-0.02em",
              }}
            >
              Pantry match score
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#9ca3af",
                lineHeight: 1.6,
              }}
            >
              Every recipe shows what % of ingredients you already own. Cook what you have today.
            </div>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              flex: 1,
              borderTop: "2px solid rgba(245,166,35,0.4)",
              paddingTop: "2.5vh",
            }}
          >
            <div
              style={{
                fontSize: "2.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.5vh",
                letterSpacing: "-0.02em",
              }}
            >
              AI Chef chat
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#9ca3af",
                lineHeight: 1.6,
              }}
            >
              Natural language queries: "I have 10 minutes and eggs — what can I make?"
            </div>
          </div>

          {/* Feature 4 */}
          <div
            style={{
              flex: 1,
              borderTop: "2px solid rgba(76,175,118,0.4)",
              paddingTop: "2.5vh",
            }}
          >
            <div
              style={{
                fontSize: "2.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.5vh",
                letterSpacing: "-0.02em",
              }}
            >
              Expiry tracking
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#9ca3af",
                lineHeight: 1.6,
              }}
            >
              Surfaces recipes that use ingredients nearing expiry. Cuts waste before it happens.
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
        03
      </div>
    </div>
  );
}
