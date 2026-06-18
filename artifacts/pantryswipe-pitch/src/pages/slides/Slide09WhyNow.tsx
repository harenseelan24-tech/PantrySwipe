export default function Slide09WhyNow() {
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
      {/* Centered purple glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          height: "90vw",
          background: "radial-gradient(circle, rgba(79,70,229,0.22) 0%, rgba(245,166,35,0.05) 30%, rgba(5,5,5,0) 65%)",
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
          Why Now
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
          Three forces converging.
        </h2>

        <div
          style={{
            display: "flex",
            gap: "4vw",
            marginTop: "6vh",
            flex: 1,
            alignItems: "flex-start",
          }}
        >
          {/* Reason 1 */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "4vw",
                fontWeight: 900,
                color: "#F5A623",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: "2vh",
              }}
            >
              61%
            </div>
            <div
              style={{
                height: "2px",
                width: "100%",
                background: "linear-gradient(to right, rgba(245,166,35,0.6), rgba(245,166,35,0))",
                marginBottom: "2vh",
              }}
            />
            <div
              style={{
                fontSize: "1.3vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.2vh",
              }}
            >
              Home cooking is sticky
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Of Singaporeans cook at home more than pre-2020. Post-COVID habits have held.
            </div>
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 300,
                color: "#374151",
                marginTop: "1.5vh",
              }}
            >
              Grab Food Trends 2023
            </div>
          </div>

          {/* Reason 2 */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "4vw",
                fontWeight: 900,
                color: "#4CAF76",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: "2vh",
              }}
            >
              ~$0
            </div>
            <div
              style={{
                height: "2px",
                width: "100%",
                background: "linear-gradient(to right, rgba(76,175,118,0.6), rgba(76,175,118,0))",
                marginBottom: "2vh",
              }}
            />
            <div
              style={{
                fontSize: "1.3vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.2vh",
              }}
            >
              GenAI margins work
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              LLM inference cost has collapsed. Per-query AI is now viable at a SGD 4.99/mo price point.
            </div>
          </div>

          {/* Reason 3 */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "4vw",
                fontWeight: 900,
                color: "#F0EDE8",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: "2vh",
              }}
            >
              0
            </div>
            <div
              style={{
                height: "2px",
                width: "100%",
                background: "linear-gradient(to right, rgba(240,237,232,0.3), rgba(240,237,232,0))",
                marginBottom: "2vh",
              }}
            />
            <div
              style={{
                fontSize: "1.3vw",
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: "1.2vh",
              }}
            >
              No dominant player in SEA
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 300,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              No app owns smart pantry + recipe discovery in Southeast Asia. The category is open.
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
        09
      </div>
    </div>
  );
}
