import { hasAnalyticsConsent } from "@/lib/consent";

let analyticsInitialized = false;

function loadScript(id: string, src: string): void {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initGoogleTagManager(gtmId: string): void {
  if (document.getElementById("sprymd-gtm")) return;

  const gtmScript = document.createElement("script");
  gtmScript.id = "sprymd-gtm";
  gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
  document.head.appendChild(gtmScript);

  const noscript = document.createElement("noscript");
  noscript.id = "sprymd-gtm-noscript";
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.prepend(noscript);
}

function initPlausible(domain: string): void {
  loadScript("sprymd-plausible", `https://plausible.io/js/script.js`);
  const script = document.getElementById("sprymd-plausible");
  if (script) {
    script.setAttribute("data-domain", domain);
    script.defer = true;
  }
}

export function initAnalytics(): void {
  if (analyticsInitialized || !hasAnalyticsConsent()) return;

  const gtmId = import.meta.env.VITE_GTM_ID;
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

  if (gtmId) initGoogleTagManager(gtmId);
  if (plausibleDomain) initPlausible(plausibleDomain);

  analyticsInitialized = true;
}

export function disableAnalytics(): void {
  analyticsInitialized = false;
  document.getElementById("sprymd-gtm")?.remove();
  document.getElementById("sprymd-gtm-noscript")?.remove();
  document.getElementById("sprymd-plausible")?.remove();
}

export function trackPageView(path: string): void {
  if (!hasAnalyticsConsent()) return;

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (plausibleDomain && typeof window.plausible === "function") {
    window.plausible("pageview", { u: path });
  }

  if (import.meta.env.VITE_GTM_ID && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: "pageview", page_path: path });
  }
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    plausible?: (event: string, options?: { u?: string }) => void;
  }
}
