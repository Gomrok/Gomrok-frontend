import { useEffect, useState } from "react";
import {
  AISection,
  ArticlesSection,
  CustomsSection,
  FooterSection,
  HeaderSection,
  HeroSection,
  MarketSection as MarketMarkup,
} from "../sections/HomeMarkup.jsx";
import { DriversSection } from "../features/drivers/DriversSection.jsx";

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

function MarketSection() {
  const [filter, setFilter] = useState("all");
  return <MarketMarkup filter={filter} onFilterChange={setFilter} />;
}

export function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        رفتن به محتوای اصلی
      </a>
      <Header />
      <main id="main">
        <HeroSection />
        <AISection />
        <CustomsSection />
        <MarketSection />
        <DriversSection />
        <ArticlesSection />
      </main>
      <FooterSection />
    </>
  );
}
