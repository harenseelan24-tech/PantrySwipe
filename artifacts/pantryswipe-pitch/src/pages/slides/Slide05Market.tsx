export default function Slide05Market() {
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
      {/* Purple glow — center */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          height: "80vw",
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
          Market Opportunity
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
          Singapore addressable market
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
          A proven urban market with high smartphone penetration and strong home-cooking culture.
        </p>

        {/* 3 stat columns */}
        <div
          style={{
            display: "flex",
            gap: "4vw",
            flex: 1,
            alignItems: "flex-start",
          }}
        >
          {/* Stat 1 */}
          <div style={{ flex: 1, borderTop: "2px solid #F5A623", paddingTop: "2.5vh" }}>
            <div
              style={{
                fontSize: "5.5vw",
                fontWeight: 900,
                color: "#F5A623",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              1.4M
            </div>
            <div
              style={{
                fontSize: "1.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginTop: "1.5vh",
                marginBottom: "1vh",
              }}
            >
              Smartphone households
            </div>
            <div
              style={{
                fontSize: "1vw",
                fontWeight: 300,
                color: "#6b7280",
              }}
            >
              Statista 2024 — Singapore
            </div>
          </div>

          {/* Stat 2 */}
          <div style={{ flex: 1, borderTop: "2px solid #4CAF76", paddingTop: "2.5vh" }}>
            <div
              style={{
                fontSize: "5.5vw",
                fontWeight: 900,
                color: "#4CAF76",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              SGD 2.1B
            </div>
            <div
              style={{
                fontSize: "1.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginTop: "1.5vh",
                marginBottom: "1vh",
              }}
            >
              Food delivery & meal-kit sector
            </div>
            <div
              style={{
                fontSize: "1vw",
                fontWeight: 300,
                color: "#6b7280",
              }}
            >
              Singapore market, 2024
            </div>
          </div>

          {/* Stat 3 */}
          <div style={{ flex: 1, borderTop: "2px solid rgba(245,166,35,0.5)", paddingTop: "2.5vh" }}>
            <div
              style={{
                fontSize: "5.5vw",
                fontWeight: 900,
                color: "#F0EDE8",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              USD 34B
            </div>
            <div
              style={{
                fontSize: "1.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginTop: "1.5vh",
                marginBottom: "1vh",
              }}
            >
              SEA food tech by 2027
            </div>
            <div
              style={{
                fontSize: "1vw",
                fontWeight: 300,
                color: "#6b7280",
              }}
            >
              Momentum Works projection
            </div>
          </div>
        </div>

        {/* Target line */}
        <div
          style={{
            marginTop: "4vh",
            paddingTop: "3vh",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "2vw",
          }}
        >
          <div
            style={{
              width: "2vw",
              height: "2px",
              backgroundColor: "#F5A623",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "1.2vw",
              fontWeight: 400,
              color: "#9ca3af",
            }}
          >
            Target: 2% of SG households = 28,000 paid subscribers in Year 1
          </span>
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
        05
      </div>
    </div>
  );
}
