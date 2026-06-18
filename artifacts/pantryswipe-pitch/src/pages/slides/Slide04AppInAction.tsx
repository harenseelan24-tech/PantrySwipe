const base = import.meta.env.BASE_URL;

export default function Slide04AppInAction() {
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
      {/* Saffron glow behind phone */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, rgba(79,70,229,0.1) 35%, rgba(5,5,5,0) 70%)",
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
          App in Action
        </span>
      </div>

      {/* Split layout */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 3,
          alignItems: "center",
          paddingTop: "13vh",
          paddingBottom: "10vh",
          paddingLeft: "7vw",
          paddingRight: "7vw",
          boxSizing: "border-box",
          gap: "5vw",
        }}
      >
        {/* Left — text */}
        <div style={{ width: "40%", flexShrink: 0 }}>
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
            Live on iOS
            <br />
            and Android.
          </h2>

          <div
            style={{
              width: "3vw",
              height: "2px",
              backgroundColor: "#F5A623",
              marginTop: "3vh",
              marginBottom: "3vh",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#F5A623",
                  marginTop: "0.6vh",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "1.2vw",
                  fontWeight: 400,
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                Tinder-style swipe deck with pantry match score
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#4CAF76",
                  marginTop: "0.6vh",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "1.2vw",
                  fontWeight: 400,
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                Smart pantry tracker with expiry alerts
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#F5A623",
                  marginTop: "0.6vh",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "1.2vw",
                  fontWeight: 400,
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                AI Chef · Meal Planner · Cook Mode · Social feed
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#4CAF76",
                  marginTop: "0.6vh",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "1.2vw",
                  fontWeight: 400,
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                Gamification: XP, streaks, achievement badges
              </span>
            </div>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <img
            src={`${base}phone-mockup.png`}
            crossOrigin="anonymous"
            alt="PantrySwipe app screens"
            style={{
              height: "80%",
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 30px 60px rgba(245,166,35,0.25)) drop-shadow(0 10px 30px rgba(0,0,0,0.8))",
            }}
          />
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
        04
      </div>
    </div>
  );
}
