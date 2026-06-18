export default function Slide02Problem() {
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
      {/* Purple glow — left side */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "20%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, rgba(5,5,5,0) 65%)",
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
          The Problem
        </span>
      </div>

      {/* Main layout — two columns */}
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
          alignItems: "center",
          gap: "6vw",
        }}
      >
        {/* Left — hero stat */}
        <div
          style={{
            width: "42%",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "13vw",
              fontWeight: 900,
              color: "#F5A623",
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
            }}
          >
            130k
          </div>
          <div
            style={{
              height: "2px",
              width: "100%",
              background: "linear-gradient(to right, rgba(245,166,35,0.5), rgba(245,166,35,0))",
              marginTop: "2vh",
              marginBottom: "2vh",
            }}
          />
          <div
            style={{
              fontSize: "1.2vw",
              fontWeight: 400,
              color: "#9ca3af",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Tonnes of food wasted in Singapore per year
          </div>
          <div
            style={{
              fontSize: "0.9vw",
              fontWeight: 300,
              color: "#4b5563",
              marginTop: "1.5vh",
              letterSpacing: "0.05em",
            }}
          >
            NEA 2023 — the largest single waste stream in the country
          </div>
        </div>

        {/* Right — context bullets */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "4vh",
          }}
        >
          <div>
            <div
              style={{
                width: "2vw",
                height: "2px",
                backgroundColor: "#F5A623",
                marginBottom: "1.5vh",
              }}
            />
            <div
              style={{
                fontSize: "3.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              SGD 258
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 400,
                color: "#9ca3af",
                marginTop: "0.8vh",
              }}
            >
              thrown away per household, per month
            </div>
          </div>

          <div>
            <div
              style={{
                width: "2vw",
                height: "2px",
                backgroundColor: "#4CAF76",
                marginBottom: "1.5vh",
              }}
            />
            <div
              style={{
                fontSize: "3.2vw",
                fontWeight: 700,
                color: "#F0EDE8",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              "What should I cook?"
            </div>
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 400,
                color: "#9ca3af",
                marginTop: "0.8vh",
              }}
            >
              Existing apps show you what to cook — not what you can cook right now, with what you already have.
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

      {/* Slide number */}
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
        02
      </div>

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
    </div>
  );
}
