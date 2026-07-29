/**
 * Ospry — SpryMD AI care agent
 * White-brindle greyhound/whippet mix with exaggerated flopping skin folds
 * and a heavy dewlap (second chin) that hangs and jiggles.
 */
export default function Ospry({ className = "", size = 440 }) {
  return (
    <div
      className={`ospry-stage ${className}`}
      role="img"
      aria-label="Ospry, SpryMD AI care agent — a white brindle greyhound-whippet with floppy skin folds"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: size,
        marginInline: "auto",
        aspectRatio: "1 / 1.05",
      }}
    >
      {/* Soft ground glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          bottom: "6%",
          height: "12%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(30,200,165,0.18), transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <svg
        viewBox="0 0 420 440"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <linearGradient id="ospryFur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F7F5F1" />
            <stop offset="45%" stopColor="#EDE8E0" />
            <stop offset="100%" stopColor="#D8D0C4" />
          </linearGradient>
          <linearGradient id="ospryBrindle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A342E" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1A1612" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="ospryDewlap" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#F4EFE8" />
            <stop offset="40%" stopColor="#E6DDD2" />
            <stop offset="100%" stopColor="#C9BDB0" />
          </linearGradient>
          <radialGradient id="ospryNose" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#4A4440" />
            <stop offset="100%" stopColor="#1A1614" />
          </radialGradient>
          <filter id="osprySoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
            <feOffset dy="1" result="o" />
            <feMerge>
              <feMergeNode in="o" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="ospryBodyClip">
            <ellipse cx="210" cy="250" rx="78" ry="118" />
          </clipPath>
        </defs>

        {/* Tail */}
        <g className="ospry-tail" style={{ transformOrigin: "268px 210px" }}>
          <path
            d="M268 210 C310 190 338 210 348 248 C352 264 340 272 328 262 C310 248 292 236 268 228"
            fill="url(#ospryFur)"
            stroke="rgba(40,35,30,0.18)"
            strokeWidth="1"
          />
          <path d="M300 220 C318 228 330 244 334 258" stroke="rgba(40,35,30,0.28)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* Hind legs */}
        <g className="ospry-leg-back">
          <path d="M168 300 C160 340 158 370 162 392 L176 392 C178 360 182 330 190 300 Z" fill="url(#ospryFur)" />
          <path d="M236 305 C248 345 258 372 268 392 L282 392 C274 360 262 330 252 305 Z" fill="url(#ospryFur)" />
          <ellipse cx="169" cy="396" rx="14" ry="6" fill="#E8E0D6" />
          <ellipse cx="275" cy="396" rx="14" ry="6" fill="#E8E0D6" />
        </g>

        {/* Body — deep chest, whippet tuck */}
        <g className="ospry-breathe" style={{ transformOrigin: "210px 240px" }}>
          <path
            d="M150 220
               C140 180 155 140 190 118
               C210 108 235 112 255 128
               C280 150 292 190 285 235
               C278 285 255 320 230 340
               C210 352 185 348 168 330
               C150 305 145 265 150 220 Z"
            fill="url(#ospryFur)"
            filter="url(#osprySoft)"
          />
          {/* Brindle stripes on body */}
          <g clipPath="url(#ospryBodyClip)" opacity="0.85">
            <path d="M175 140 C190 180 185 230 170 280" stroke="url(#ospryBrindle)" strokeWidth="7" strokeLinecap="round" />
            <path d="M195 130 C205 175 210 230 200 295" stroke="url(#ospryBrindle)" strokeWidth="5" strokeLinecap="round" />
            <path d="M220 135 C230 185 235 240 228 300" stroke="url(#ospryBrindle)" strokeWidth="6" strokeLinecap="round" />
            <path d="M245 150 C255 195 258 245 250 290" stroke="url(#ospryBrindle)" strokeWidth="4" strokeLinecap="round" />
            <path d="M160 200 C175 230 180 270 175 310" stroke="url(#ospryBrindle)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Flopping shoulder / back skin folds */}
          <g className="ospry-flop-a" style={{ transformOrigin: "200px 175px" }}>
            <path
              d="M165 155 C180 145 210 148 235 160 C250 170 248 185 230 188 C205 192 180 188 165 178 Z"
              fill="#EFE8DE"
              stroke="rgba(60,50,40,0.12)"
              strokeWidth="1"
            />
            <path d="M175 168 C195 162 220 165 238 175" stroke="rgba(80,70,60,0.22)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M172 178 C195 172 218 174 232 182" stroke="rgba(80,70,60,0.16)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
          <g className="ospry-flop-b" style={{ transformOrigin: "215px 200px" }}>
            <path
              d="M158 190 C175 178 215 175 248 188 C262 196 258 215 240 218 C210 224 178 220 158 208 Z"
              fill="#E8E0D4"
              stroke="rgba(60,50,40,0.1)"
              strokeWidth="1"
              opacity="0.95"
            />
            <path d="M168 202 C195 192 225 194 245 205" stroke="rgba(70,60,50,0.2)" strokeWidth="1.4" fill="none" />
            <path d="M165 212 C192 204 222 206 240 214" stroke="rgba(70,60,50,0.14)" strokeWidth="1.1" fill="none" />
          </g>
        </g>

        {/* Front legs */}
        <g>
          <path d="M178 310 C172 350 168 375 170 398 L184 398 C186 370 190 345 196 315 Z" fill="url(#ospryFur)" />
          <path d="M218 315 C224 352 230 378 236 398 L250 398 C246 372 240 348 232 318 Z" fill="url(#ospryFur)" />
          <ellipse cx="177" cy="400" rx="13" ry="5.5" fill="#E8E0D6" />
          <ellipse cx="243" cy="400" rx="13" ry="5.5" fill="#E8E0D6" />
        </g>

        {/* Neck + DEWLAP / second chin — sack-like hanging fold */}
        <g className="ospry-dewlap" style={{ transformOrigin: "198px 145px" }}>
          {/* Upper neck skin */}
          <path
            d="M175 118 C168 135 165 150 170 165 C178 178 198 182 218 172 C228 165 230 150 225 135 C220 120 200 110 175 118 Z"
            fill="url(#ospryFur)"
          />
          {/* Primary hanging dewlap — bilobed / sack silhouette */}
          <path
            className="ospry-dewlap-sack"
            d="M178 148
               C168 158 162 175 166 195
               C168 208 176 218 188 220
               C196 222 202 218 205 210
               C208 218 214 222 222 220
               C234 216 242 204 242 190
               C242 172 234 156 222 148
               C210 140 192 140 178 148 Z"
            fill="url(#ospryDewlap)"
            stroke="rgba(70,60,50,0.18)"
            strokeWidth="1.2"
          />
          {/* Center cleft + wrinkle detail on dewlap */}
          <path d="M205 168 C204 185 204 200 205 214" stroke="rgba(90,75,65,0.28)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M186 175 C190 190 192 205 190 216" stroke="rgba(90,75,65,0.18)" strokeWidth="1.1" fill="none" />
          <path d="M224 174 C220 190 220 204 222 215" stroke="rgba(90,75,65,0.18)" strokeWidth="1.1" fill="none" />
          <ellipse cx="190" cy="198" rx="10" ry="14" fill="rgba(120,100,85,0.08)" />
          <ellipse cx="220" cy="198" rx="10" ry="14" fill="rgba(120,100,85,0.08)" />
          {/* Outer flopping fold ring */}
          <path
            className="ospry-flop-c"
            d="M172 155 C162 170 160 190 168 205 C155 195 152 175 162 160 Z"
            fill="#E2D8CC"
            opacity="0.9"
          />
          <path
            className="ospry-flop-c"
            d="M248 155 C258 170 260 190 252 205 C265 195 268 175 258 160 Z"
            fill="#E2D8CC"
            opacity="0.9"
          />
        </g>

        {/* Head */}
        <g className="ospry-head" style={{ transformOrigin: "200px 95px" }}>
          {/* Ears — rose/semi-prick whippet style, floppy tip */}
          <g className="ospry-ear-l" style={{ transformOrigin: "155px 78px" }}>
            <path d="M168 85 C145 60 128 72 138 95 C145 108 158 112 170 100 Z" fill="url(#ospryFur)" stroke="rgba(50,40,35,0.15)" />
            <path d="M160 88 C148 78 142 85 148 96" fill="#D4C4B4" opacity="0.7" />
          </g>
          <g className="ospry-ear-r" style={{ transformOrigin: "245px 78px" }}>
            <path d="M232 85 C255 60 272 72 262 95 C255 108 242 112 230 100 Z" fill="url(#ospryFur)" stroke="rgba(50,40,35,0.15)" />
            <path d="M240 88 C252 78 258 85 252 96" fill="#D4C4B4" opacity="0.7" />
          </g>

          {/* Skull + long muzzle */}
          <path
            d="M155 95
               C150 70 170 48 200 46
               C230 48 250 70 245 95
               C248 115 235 128 220 135
               C210 140 190 140 180 135
               C165 128 152 115 155 95 Z"
            fill="url(#ospryFur)"
            filter="url(#osprySoft)"
          />
          {/* Face skin folds */}
          <g className="ospry-flop-a" style={{ transformOrigin: "200px 100px" }}>
            <path d="M165 100 C180 92 220 92 235 100" stroke="rgba(70,60,50,0.25)" strokeWidth="1.5" fill="none" />
            <path d="M168 112 C185 106 215 106 232 112" stroke="rgba(70,60,50,0.18)" strokeWidth="1.2" fill="none" />
            <path d="M172 88 C190 82 210 82 228 88" stroke="rgba(70,60,50,0.2)" strokeWidth="1.2" fill="none" />
          </g>
          {/* Brindle on head */}
          <path d="M175 60 C182 78 180 100 172 120" stroke="url(#ospryBrindle)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M210 55 C215 80 218 105 212 125" stroke="url(#ospryBrindle)" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />

          {/* Muzzle */}
          <ellipse cx="200" cy="128" rx="28" ry="18" fill="#F3EEE7" />
          <ellipse cx="200" cy="122" rx="16" ry="10" fill="#FAF7F2" />

          {/* Eyes */}
          <g className="ospry-eyes">
            <ellipse cx="178" cy="92" rx="9" ry="10" fill="#1A1816" />
            <ellipse cx="222" cy="92" rx="9" ry="10" fill="#1A1816" />
            <circle cx="180.5" cy="89" r="2.4" fill="#F5F5F5" />
            <circle cx="224.5" cy="89" r="2.4" fill="#F5F5F5" />
            <circle cx="181.5" cy="94" r="1" fill="rgba(255,255,255,0.45)" />
            <circle cx="225.5" cy="94" r="1" fill="rgba(255,255,255,0.45)" />
            {/* Blink lids */}
            <g className="ospry-blink">
              <path d="M168 92 C178 86 188 86 188 92 C188 98 178 100 168 92 Z" fill="url(#ospryFur)" />
              <path d="M212 92 C222 86 232 86 232 92 C232 98 222 100 212 92 Z" fill="url(#ospryFur)" />
            </g>
          </g>

          {/* Nose */}
          <ellipse cx="200" cy="130" rx="11" ry="8" fill="url(#ospryNose)" />
          <ellipse cx="196" cy="128" rx="2.2" ry="1.6" fill="rgba(255,255,255,0.15)" />
          {/* Mouth hint */}
          <path d="M192 140 C198 144 202 144 208 140" stroke="rgba(50,40,35,0.35)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>

        {/* Signal accent collar mark */}
        <circle cx="200" cy="156" r="3.5" fill="#1EC8A5" className="breath-glow" />
        <circle cx="200" cy="156" r="7" stroke="rgba(30,200,165,0.45)" strokeWidth="1" fill="none" />
      </svg>

      {/* Agent identity plate */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          width: "100%",
        }}
      >
        <div
          className="mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(5,5,5,0.72)",
            backdropFilter: "blur(8px)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(230,237,243,0.85)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#1EC8A5", display: "inline-block" }} className="breath-glow" />
          Ospry
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: "rgba(30,200,165,0.9)" }}>AI agent</span>
        </div>
      </div>
    </div>
  );
}
