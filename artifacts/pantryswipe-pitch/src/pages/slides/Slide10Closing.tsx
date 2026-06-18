export default function Slide10Closing() {
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
      {/* Large saffron glow — center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          height: "100vw",
          background: "radial-gradient(circle, rgba(245,166,35,0.18) 0%, rgba(79,70,229,0.12) 30%, rgba(5,5,5,0) 65%)",
          zIndex: 1,
          filter: "blur(100px)",
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
          Singapore · 2026
        </span>
      </div>

      {/* Main content — centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
          textAlign: "center",
          width: "72vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "5.5vw",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#F0EDE8",
            textWrap: "balance",
          }}
        >
          Let's build together.
        </h2>

        <p
          style={{
            fontSize: "1.4vw",
            fontWeight: 300,
            color: "#9ca3af",
            marginTop: "3vh",
            maxWidth: "48vw",
            lineHeight: 1.6,
          }}
        >
          Looking for a Technical Co-Founder who wants to own the engineering of a category-defining food app.
          Equity split open to discussion based on contribution.
        </p>

        {/* Divider */}
        <div
          style={{
            width: "5vw",
            height: "2px",
            backgroundColor: "#F5A623",
            marginTop: "4vh",
            marginBottom: "4vh",
          }}
        />

        {/* Contact */}
        <div
          style={{
            display: "flex",
            gap: "5vw",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "0.8vh",
              }}
            >
              Email
            </div>
            <div
              style={{
                fontSize: "1.4vw",
                fontWeight: 400,
                color: "#F0EDE8",
              }}
            >
              Harenseelan24@gmail.com
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "5vh",
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "0.8vh",
              }}
            >
              Product
            </div>
            <div
              style={{
                fontSize: "1.4vw",
                fontWeight: 400,
                color: "#F0EDE8",
              }}
            >
              pantryswipe.app
            </div>
          </div>
        </div>
      </div>

      {/* Vignette edges */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          boxShadow: "inset 0 0 15vw rgba(0,0,0,0.7)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "20vh",
          background: "linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0) 100%)",
          zIndex: 4,
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
        10
      </div>
    </div>
  );
}
