import type { MouseEvent } from "react";

/**
 * Keyboard users can jump past the header/nav. Falls back to the first <main>
 * when a page has not opted into the `main-content` id.
 */
const SkipToContent = () => {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("main-content") ?? document.querySelector<HTMLElement>("main");
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  };

  return (
    <a href="#main-content" className="skip-link" onClick={onClick}>
      Skip to main content
    </a>
  );
};

export default SkipToContent;
