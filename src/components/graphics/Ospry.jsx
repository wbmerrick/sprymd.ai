/**
 * Ospry — SpryMD AI care agent
 * White-brindle greyhound/whippet mix with exaggerated flopping skin folds
 * and a heavy bilobed dewlap (second chin) that hangs and jiggles.
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
        aspectRatio: "1 / 1.08",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          bottom: "8%",
          height: "14%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(30,200,165,0.2), transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      <svg
        viewBox="0 0 420 460"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <linearGradient id="ospryFur" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#FFFCFA" />
            <stop offset="40%" stopColor="#F4EEE6" />
            <stop offset="100%" stopColor="#D9CFC2" />
          </linearGradient>
          <linearGradient id="ospryBrindle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2C261F" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#5A4A3A" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="ospryDewlap" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#F6F0E8" />
            <stop offset="45%" stopColor="#E4D8C8" />
            <stop offset="100%" stopColor="#BFAE9A" />
          </linearGradient>
          <radialGradient id="ospryNose" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#55504C" />
            <stop offset="100%" stopColor="#14110F" />
          </radialGradient>
          <filter id="osprySoft" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.28" />
          </filter>
          <clipPath id="ospryTorsoClip">
            <path d="M145 200 C138 155 160 115 200 105 C245 115 270 160 262 215 C254 280 230 330 200 345 C170 330 150 270 145 200 Z" />
          </clipPath>
        </defs>

        {/* Tail */}
        <g className="ospry-tail" style={{ transformOrigin: "275px 215px" }}>
          <path
            d="M270 215 C315 188 350 205 362 250 C366 268 352 278 338 266 C315 248 292 235 270 230"
            fill="url(#ospryFur)"
            stroke="rgba(40,35,30,0.2)"
            strokeWidth="1"
            filter="url(#osprySoft)"
          />
          <path d="M305 218 C328 230 342 248 348 264" stroke="rgba(45,38,30,0.35)" strokeWidth="4" strokeLinecap="round" />
          <path d="M318 225 C335 238 345 252 350 262" stroke="rgba(45,38,30,0.2)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Hind legs */}
        <path d="M160 315 C150 360 146 392 152 418 L170 418 C174 380 180 348 192 318 Z" fill="url(#ospryFur)" stroke="rgba(40,35,30,0.1)" />
        <path d="M240 320 C255 365 268 395 280 418 L298 418 C288 380 272 348 258 322 Z" fill="url(#ospryFur)" stroke="rgba(40,35,30,0.1)" />
        <ellipse cx="161" cy="422" rx="16" ry="7" fill="#EDE5DB" />
        <ellipse cx="289" cy="422" rx="16" ry="7" fill="#EDE5DB" />

        {/* Torso */}
        <g className="ospry-breathe" style={{ transformOrigin: "205px 245px" }}>
          <path
            d="M148 215
               C138 165 158 120 195 105
               C220 96 250 105 268 130
               C290 165 298 210 288 255
               C276 315 248 355 215 372
               C190 382 165 370 152 345
               C138 310 142 260 148 215 Z"
            fill="url(#ospryFur)"
            filter="url(#osprySoft)"
            stroke="rgba(50,42,35,0.12)"
            strokeWidth="1"
          />

          {/* Strong brindle */}
          <g clipPath="url(#ospryTorsoClip)">
            <path d="M168 125 C182 175 178 240 162 310" stroke="url(#ospryBrindle)" strokeWidth="9" strokeLinecap="round" />
            <path d="M190 115 C200 170 205 240 192 320" stroke="url(#ospryBrindle)" strokeWidth="7" strokeLinecap="round" />
            <path d="M215 112 C225 175 230 245 218 325" stroke="url(#ospryBrindle)" strokeWidth="8" strokeLinecap="round" />
            <path d="M242 130 C252 185 255 250 245 310" stroke="url(#ospryBrindle)" strokeWidth="6" strokeLinecap="round" />
            <path d="M158 185 C170 230 172 280 165 330" stroke="url(#ospryBrindle)" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
            <path d="M260 175 C268 220 268 270 258 315" stroke="url(#ospryBrindle)" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Big flopping dorsal / shoulder skin sheets */}
          <g className="ospry-flop-a" style={{ transformOrigin: "205px 165px" }}>
            <path
              d="M155 145 C175 125 220 122 255 142 C272 155 268 178 245 185 C215 195 175 192 155 172 Z"
              fill="#F0E8DC"
              stroke="rgba(70,55,45,0.2)"
              strokeWidth="1.2"
            />
            <path d="M165 158 C195 145 230 148 252 165" stroke="rgba(80,65,50,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M162 172 C195 160 228 162 248 175" stroke="rgba(80,65,50,0.25)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M168 182 C198 172 225 174 242 183" stroke="rgba(80,65,50,0.18)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </g>
          <g className="ospry-flop-b" style={{ transformOrigin: "200px 205px" }}>
            <path
              d="M148 185 C170 165 225 160 265 180 C282 192 278 218 255 228 C220 240 175 235 148 212 Z"
              fill="#E8DDD0"
              stroke="rgba(70,55,45,0.18)"
              strokeWidth="1.2"
            />
            <path d="M158 200 C195 185 235 188 260 205" stroke="rgba(75,60,48,0.3)" strokeWidth="1.8" fill="none" />
            <path d="M155 215 C192 200 232 202 255 216" stroke="rgba(75,60,48,0.22)" strokeWidth="1.4" fill="none" />
            <path d="M160 226 C195 214 228 216 248 226" stroke="rgba(75,60,48,0.15)" strokeWidth="1.2" fill="none" />
          </g>
          <g className="ospry-flop-a" style={{ transformOrigin: "210px 245px", animationDelay: "0.35s" }}>
            <path
              d="M155 235 C178 220 230 218 262 235 C275 245 270 268 248 275 C215 285 175 280 155 258 Z"
              fill="#E2D6C8"
              opacity="0.92"
              stroke="rgba(70,55,45,0.14)"
            />
            <path d="M165 250 C200 238 235 240 255 252" stroke="rgba(75,60,48,0.22)" strokeWidth="1.4" fill="none" />
          </g>
        </g>

        {/* Front legs */}
        <path d="M172 330 C164 375 160 402 164 424 L182 424 C186 390 192 360 200 335 Z" fill="url(#ospryFur)" />
        <path d="M220 335 C228 378 236 405 244 424 L262 424 C256 392 246 362 236 338 Z" fill="url(#ospryFur)" />
        <ellipse cx="173" cy="428" rx="15" ry="6.5" fill="#EDE5DB" />
        <ellipse cx="253" cy="428" rx="15" ry="6.5" fill="#EDE5DB" />

        {/* Neck + massive bilobed dewlap (second chin) */}
        <g className="ospry-dewlap" style={{ transformOrigin: "205px 135px" }}>
          <path
            d="M170 108 C160 130 158 155 168 175 C180 192 205 198 230 185 C245 175 248 150 240 128 C232 108 200 98 170 108 Z"
            fill="url(#ospryFur)"
          />

          {/* Side skin flaps that flop outward */}
          <path
            className="ospry-flop-c"
            d="M162 140 C145 155 138 185 150 210 C135 195 130 165 145 145 Z"
            fill="#E6DACB"
            stroke="rgba(70,55,45,0.15)"
          />
          <path
            className="ospry-flop-c"
            d="M248 140 C265 155 272 185 260 210 C275 195 280 165 265 145 Z"
            fill="#E6DACB"
            stroke="rgba(70,55,45,0.15)"
            style={{ animationDelay: "0.15s" }}
          />

          {/* The hanging bilobed sack / second chin */}
          <g className="ospry-dewlap-sack" style={{ transformOrigin: "205px 175px" }}>
            <path
              d="M168 145
                 C152 160 145 185 152 215
                 C156 235 168 250 185 254
                 C195 256 202 250 205 238
                 C208 250 215 256 225 254
                 C242 250 256 232 258 210
                 C265 180 255 155 240 145
                 C220 132 188 132 168 145 Z"
              fill="url(#ospryDewlap)"
              stroke="rgba(70,55,45,0.28)"
              strokeWidth="1.5"
              filter="url(#osprySoft)"
            />
            {/* Deep center cleft — reads as two lobes */}
            <path d="M205 160 C203 185 203 215 205 242" stroke="rgba(90,70,55,0.4)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M205 175 C198 190 198 215 205 235" stroke="rgba(90,70,55,0.18)" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Left lobe shading + wrinkles */}
            <ellipse cx="182" cy="210" rx="16" ry="22" fill="rgba(110,90,70,0.12)" />
            <path d="M172 175 C178 200 180 225 176 245" stroke="rgba(90,70,55,0.28)" strokeWidth="1.5" fill="none" />
            <path d="M186 180 C190 205 192 228 188 246" stroke="rgba(90,70,55,0.2)" strokeWidth="1.2" fill="none" />
            {/* Right lobe */}
            <ellipse cx="228" cy="210" rx="16" ry="22" fill="rgba(110,90,70,0.12)" />
            <path d="M238 175 C232 200 230 225 234 245" stroke="rgba(90,70,55,0.28)" strokeWidth="1.5" fill="none" />
            <path d="M224 180 C220 205 218 228 222 246" stroke="rgba(90,70,55,0.2)" strokeWidth="1.2" fill="none" />
            {/* Underside highlight so the hang reads in space */}
            <path d="M175 240 C190 252 220 252 235 240" stroke="rgba(255,250,245,0.25)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* Head */}
        <g className="ospry-head" style={{ transformOrigin: "205px 90px" }}>
          <g className="ospry-ear-l" style={{ transformOrigin: "158px 72px" }}>
            <path d="M172 80 C142 48 118 62 132 95 C140 112 158 118 175 100 Z" fill="url(#ospryFur)" stroke="rgba(50,40,35,0.18)" filter="url(#osprySoft)" />
            <path d="M158 82 C140 68 132 78 142 96" fill="#D2BFAC" opacity="0.85" />
          </g>
          <g className="ospry-ear-r" style={{ transformOrigin: "252px 72px" }}>
            <path d="M238 80 C268 48 292 62 278 95 C270 112 252 118 235 100 Z" fill="url(#ospryFur)" stroke="rgba(50,40,35,0.18)" filter="url(#osprySoft)" />
            <path d="M252 82 C270 68 278 78 268 96" fill="#D2BFAC" opacity="0.85" />
          </g>

          <path
            d="M155 92
               C148 62 172 38 205 36
               C238 38 262 62 255 92
               C260 118 242 135 222 144
               C210 150 200 150 188 144
               C168 135 150 118 155 92 Z"
            fill="url(#ospryFur)"
            filter="url(#osprySoft)"
            stroke="rgba(50,42,35,0.12)"
          />

          {/* Face wrinkles that flop */}
          <g className="ospry-flop-a" style={{ transformOrigin: "205px 95px" }}>
            <path d="M168 95 C190 82 220 82 242 95" stroke="rgba(70,55,45,0.35)" strokeWidth="2" fill="none" />
            <path d="M170 110 C192 100 218 100 240 110" stroke="rgba(70,55,45,0.28)" strokeWidth="1.6" fill="none" />
            <path d="M175 78 C195 70 215 70 235 78" stroke="rgba(70,55,45,0.25)" strokeWidth="1.4" fill="none" />
            <path d="M172 122 C195 114 215 114 238 122" stroke="rgba(70,55,45,0.2)" strokeWidth="1.3" fill="none" />
          </g>

          <path d="M178 55 C186 82 184 112 172 140" stroke="url(#ospryBrindle)" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <path d="M215 48 C222 82 226 115 218 145" stroke="url(#ospryBrindle)" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />

          <ellipse cx="205" cy="132" rx="32" ry="20" fill="#FAF6F0" />
          <ellipse cx="205" cy="126" rx="18" ry="11" fill="#FFFCF8" />

          <g className="ospry-eyes">
            <ellipse cx="180" cy="88" rx="10" ry="11" fill="#14110F" />
            <ellipse cx="230" cy="88" rx="10" ry="11" fill="#14110F" />
            <circle cx="183" cy="84" r="2.8" fill="#F8F8F8" />
            <circle cx="233" cy="84" r="2.8" fill="#F8F8F8" />
            <circle cx="184.5" cy="91" r="1.1" fill="rgba(255,255,255,0.5)" />
            <circle cx="234.5" cy="91" r="1.1" fill="rgba(255,255,255,0.5)" />
            <g className="ospry-blink">
              <path d="M169 88 C180 80 191 80 191 88 C191 96 180 98 169 88 Z" fill="url(#ospryFur)" />
              <path d="M219 88 C230 80 241 80 241 88 C241 96 230 98 219 88 Z" fill="url(#ospryFur)" />
            </g>
          </g>

          <ellipse cx="205" cy="134" rx="13" ry="9" fill="url(#ospryNose)" />
          <ellipse cx="200" cy="131" rx="2.5" ry="1.8" fill="rgba(255,255,255,0.18)" />
          <path d="M195 146 C202 151 208 151 215 146" stroke="rgba(50,40,35,0.4)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>

        {/* Signal core */}
        <circle cx="205" cy="168" r="4.5" fill="#1EC8A5" className="breath-glow" />
        <circle cx="205" cy="168" r="9" stroke="rgba(30,200,165,0.5)" strokeWidth="1.2" fill="none" />
        <circle cx="205" cy="168" r="14" stroke="rgba(30,200,165,0.2)" strokeWidth="1" fill="none" />
      </svg>

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
            background: "rgba(5,5,5,0.75)",
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
