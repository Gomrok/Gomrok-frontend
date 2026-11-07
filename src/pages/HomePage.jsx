import { useEffect } from "react";
import {
  AISection,
  ArticlesSection,
  CustomsSection,
  FooterSection,
  HeaderSection,
  ProductSearchSection,
  HeroSection,
} from "../sections/HomeMarkup.jsx";
import { DriversSection } from "../features/drivers/DriversSection.jsx";
import { MarketDashboard } from "../features/market/MarketDashboard.jsx";
import { HOME_SECTION_ORDER } from "../config/platform.js";

function Header() {
  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastScroll = window.scrollY;
    let lastDirection = 0;
    let accumulated = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const current = Math.max(0, window.scrollY);
      const delta = current - lastScroll;
      const direction = Math.sign(delta);
      if (direction !== lastDirection) accumulated = 0;
      accumulated += Math.abs(delta);

      if (current < 120 || header.contains(document.activeElement)) {
        header.classList.remove("header-hidden", "header-reveal");
      } else if (accumulated > 16) {
        header.classList.toggle("header-hidden", direction > 0);
        header.classList.toggle("header-reveal", direction < 0);
      }

      lastScroll = current;
      lastDirection = direction;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onFocus = () => header.classList.remove("header-hidden");
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("scroll", onScroll);
      header.removeEventListener("focusin", onFocus);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <HeaderSection />;
}

export function HomePage() {
  useEffect(() => {
    let disposed = false;
    let userMoved = false;
    const markInteraction = () => { userMoved = true; };
    const frames = [];
    const alignHash = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    frames.push(window.requestAnimationFrame(alignHash));
    for (const name of ["wheel", "touchstart", "keydown"]) window.addEventListener(name, markInteraction, { passive: true });
    document.fonts.ready.then(() => { if (!disposed && !userMoved) frames.push(window.requestAnimationFrame(() => frames.push(window.requestAnimationFrame(() => { if (!disposed && !userMoved) alignHash(); })))); });
    return () => { disposed = true; frames.forEach(window.cancelAnimationFrame); for (const name of ["wheel", "touchstart", "keydown"]) window.removeEventListener(name, markInteraction); };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        رفتن به محتوای اصلی
      </a>
      <Header />
      <main id="main">
        <ProductSearchSection />
        <HeroSection />
        {HOME_SECTION_ORDER.map((id, index) => id === "ai" ? <AISection key={id} number={new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index + 1)} /> : <CustomsSection key={id} number={new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index + 1)} />)}
        <MarketDashboard />
        <DriversSection />
        <ArticlesSection />
      </main>
      <FooterSection />
    </>
  );
}
