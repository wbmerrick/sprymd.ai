import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyHead, organizationJsonLd } from "@/lib/seo";
import { metaForPath } from "@/seo/routes";

/**
 * Applies per-route title, description, canonical, social tags and robots
 * directives on every navigation. Render it once inside the router, before
 * <Routes>, so page components can still override the head in their own
 * effects (React runs earlier siblings' effects first).
 */
const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaForPath(pathname);
    applyHead({
      title: meta.title,
      pageTitle: meta.pageTitle,
      description: meta.description,
      path: pathname,
      noindex: !meta.indexable,
      jsonLd: pathname === "/" ? organizationJsonLd() : null,
    });
  }, [pathname]);

  return null;
};

export default RouteSeo;
