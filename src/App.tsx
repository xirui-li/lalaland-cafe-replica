import { useEffect, useRef, useState, type ReactNode } from "react";
import catalogData from "./catalog.json";
import ThemeFilters from "./ThemeFilters";
import { store, storeDirectionsUrl } from "./store";

const homeUrl = import.meta.env.BASE_URL;
const assetUrl = (path: string) => `${homeUrl}${path.replace(/^\//, "")}`;
type ProductImage = { src: string; alt: string; clipPath?: string };
type Collection = {
  id: string;
  title: string;
  description: string;
  products: {
    id: string;
    title: string;
    series: string;
    price?: string;
    images: ProductImage[];
  }[];
};
const sourceCatalog: Collection[] = catalogData;
const catalog = sourceCatalog.map((collection) => ({
  ...collection,
  products: collection.products.map((product) => ({
    ...product,
    images: product.images.map((image) => ({
      ...image,
      src: assetUrl(image.src),
    })),
  })),
}));
type Product = (typeof catalog)[number]["products"][number];
type Overlay = "search" | "menu" | "accessibility" | null;
const allProducts = catalog.flatMap((collection) => collection.products);
const productById = (id: string) => allProducts.find((product) => product.id === id)!;
const featuredProducts = ["swirl-og", "dome-matcha-strawberry", "bulk-seoul-strawberry-honeycomb"].map(productById);
const nav = [
  ["home", homeUrl],
  ["our yogurt", "#yogurt"],
  ["our story", "#about-thick"],
  ["meet Bao", "#meet-bao"],
  ["our store", "#our-store"],
];
const footerGroups = [
  {
    title: "THICK.",
    links: [
      ["Home", homeUrl],
      ["Our Yogurt", "#yogurt"],
      ["About THICK.", "#about-thick"],
    ],
  },
  {
    title: "Visit",
    links: [
      ["Our Store", "#our-store"],
      ["Hours & Address", "#our-store"],
      ["Get Directions", storeDirectionsUrl],
    ],
  },
  {
    title: "Say hello",
    links: [
      [store.phone, store.phoneHref],
      ["Washington, DC", "#our-store"],
    ],
  },
];

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    phone: (
      <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z" />
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.8" />
        <path d="m15.5 15.5 6 6" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="7" r="3.7" />
        <path d="M3.5 22v-3c0-6.3 17-6.3 17 0v3z" />
      </>
    ),
    bag: (
      <>
        <path d="M4 4h16l1 17H3L4 4Z" />
        <path d="M8 4v2a4 4 0 0 0 8 0V4" />
      </>
    ),
    menu: (
      <>
        <path d="M3 5h18M3 12h18M3 19h18" />
      </>
    ),
    close: <path d="m5 5 14 14M19 5 5 19" />,
    chevron: <path d="m.5.5 4.5 4.5L9.5.5" />,
    arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M5 12h14M12 5v14" />,
    check: <path d="m4 12 5 5L20 6" />,
    person: (
      <>
        <circle cx="12" cy="4.8" r="2" fill="currentColor" stroke="none" />
        <path d="m4 9 8 1 8-1M12 10v5m0-3-4 9m4-9 4 9" strokeWidth="1.7" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      width="24"
      height="24"
      viewBox={name === "chevron" ? "0 0 10 6" : "0 0 24 24"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Modal({
  label,
  className = "",
  onClose,
  children,
}: {
  label: string;
  className?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      active?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`modal ${className}`}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-surface">
        <button
          className="icon-button modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </dialog>
  );
}

const softOpeningSlides = [
  {
    src: "/assets/soft-opening.webp",
    width: 1600,
    height: 900,
    alt: "THICK. newspaper poster: soft opening, 50% off your first bowl for new THICK Rewards members; grand opening November 21–22; free merch for members; spend $25 for a gacha spin. 1073 Wisconsin Ave NW, Georgetown, DC.",
  },
  {
    src: "/assets/opening-hours.webp",
    width: 1082,
    height: 1400,
    alt: "THICK. opening hours: soft opening now to November 20, 11:30 AM to 8 PM daily. THICK Opening grand opening weekend November 21–22, 11:30 AM to 10 PM daily, regular hours from November 21. THICK. × TOIMOI collab November 21–22 with a free photo booth for everyone, a photographer, and ribbon cutting on November 21 at 11:11 AM. First 100 in line on November 21 only: all 100 get a free THICK. sticker, the first 30 get an extra prize spin for embroidered caps, clear umbrellas, totes and more, and lucky tickets 29, 39 through 99 get $3 off their next visit. With purchase, one numbered ticket per customer. 1073 Wisconsin Ave NW, @thick_yogurt.",
  },
];

function SoftOpeningSlides() {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const go = (index: number) => {
    const el = track.current;
    if (!el) return;
    const next = (index + softOpeningSlides.length) % softOpeningSlides.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };
  useEffect(() => {
    const el = track.current!;
    const update = () => setCurrent(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const timer = window.setTimeout(() => go(current + 1), 5000);
    return () => window.clearTimeout(timer);
  }, [auto, current]);
  const stop = () => setAuto(false);
  return (
    <div
      className="soft-opening-slides"
      role="region"
      aria-roledescription="carousel"
      aria-label="Soft opening posters"
      onPointerDown={stop}
      onWheel={stop}
      onKeyDown={stop}
    >
      <div className="soft-opening-track" ref={track}>
        {softOpeningSlides.map((slide, index) => (
          <figure
            className="soft-opening-slide"
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${softOpeningSlides.length}`}
          >
            <img
              src={assetUrl(slide.src)}
              width={slide.width}
              height={slide.height}
              alt={slide.alt}
            />
          </figure>
        ))}
      </div>
      <button
        className="icon-button soft-opening-arrow previous"
        aria-label="Previous poster"
        onClick={() => { stop(); go(current - 1); }}
      >
        <Icon name="chevron" />
      </button>
      <button
        className="icon-button soft-opening-arrow next"
        aria-label="Next poster"
        onClick={() => { stop(); go(current + 1); }}
      >
        <Icon name="chevron" />
      </button>
      <div className="soft-opening-dots">
        {softOpeningSlides.map((slide, index) => (
          <button
            key={slide.src}
            aria-label={`Show poster ${index + 1}`}
            aria-current={index === current}
            onClick={() => { stop(); go(index); }}
          />
        ))}
      </div>
    </div>
  );
}

function MenuSection({ onSelect }: { onSelect: (product: Product) => void }) {
  const [active, setActive] = useState(catalog[0].id);
  const series = catalog.find((collection) => collection.id === active)!;
  return (
    <section className="menu-section" id="yogurt" aria-labelledby="menu-title">
      <div className="menu-paper page-width">
        <header className="menu-masthead">
          <p className="menu-dateline">
            <span>GEORGETOWN, DC</span>
            <span>THICK. NON-DRIPPING STRAINED YOGURT</span>
            <span>11:30 AM – 8:00 PM</span>
          </p>
          <h2 id="menu-title">Soft Opening Menu</h2>
          <p className="menu-standfirst">Good things take time. Pick your spoonful.</p>
        </header>
        <div className="menu-tabs" role="tablist" aria-label="Menu series">
          {catalog.map((collection) => (
            <button
              key={collection.id}
              role="tab"
              id={`tab-${collection.id}`}
              aria-selected={collection.id === active}
              aria-controls="menu-panel"
              className={collection.id === active ? "active" : ""}
              onClick={() => setActive(collection.id)}
            >
              {collection.title}
              <span>{collection.products.length}</span>
            </button>
          ))}
        </div>
        <div
          className="menu-panel"
          id="menu-panel"
          role="tabpanel"
          aria-labelledby={`tab-${series.id}`}
        >
          <div className="menu-series-head">
            <h3>
              {series.title}
            </h3>
            <p>{series.description}</p>
          </div>
          <ul className="menu-grid">
            {series.products.map((product, index) => (
              <li className="menu-card" key={product.id}>
                <button
                  className="menu-card-link"
                  onClick={() => onSelect(product)}
                  aria-label={`View ${product.title}`}
                >
                  <div className="menu-card-image">
                    <img
                      src={product.images[0].src}
                      alt={product.images[0].alt}
                      loading="lazy"
                    />
                  </div>
                  <div className="menu-card-copy">
                    <span className="menu-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4>{product.title}</h4>
                    {product.price && <span className="menu-price">{product.price}</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="menu-footnote">
          Soft opening menu. Selection may change daily. For today’s prices,{" "}
          <a href={store.phoneHref}>call our store</a>.
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [baoHello, setBaoHello] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [softOpening, setSoftOpening] = useState(() => {
    try {
      return sessionStorage.getItem("thick-soft-opening-seen") !== "1";
    } catch {
      return true;
    }
  });
  const closeSoftOpening = () => {
    setSoftOpening(false);
    try {
      sessionStorage.setItem("thick-soft-opening-seen", "1");
    } catch {}
  };
  const video = useRef<HTMLVideoElement>(null);
  const searchResults = allProducts.filter((product) =>
    `${product.title} ${product.series} ${product.images[0].alt}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    let previous = window.scrollY;
    const scroll = () => {
      const y = window.scrollY;
      setHeaderHidden(y > 150 && y > previous);
      previous = y;
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (reduceMotion) video.current?.pause();
    else if (!videoPaused) video.current?.play().catch(() => {});
  }, [reduceMotion, videoPaused]);
  const selectProduct = (product: Product) => {
    setOverlay(null);
    setSelected(product);
  };
  return (
    <div
      className={`site ${largeText ? "large-text" : ""} ${highContrast ? "high-contrast" : ""} ${reduceMotion ? "reduce-motion" : ""}`}
    >
      <ThemeFilters />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        <a href="#our-store">
          Your yogurt stop in Washington, DC <Icon name="arrow" />
        </a>
      </div>
      <header className={`site-header ${headerHidden ? "is-hidden" : ""}`}>
        <div className="header-inner page-width">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open menu"
            onClick={() => setOverlay("menu")}
          >
            <Icon name="menu" />
          </button>
          <a className="brand" href={homeUrl} aria-label="THICK. home">
            <img
              src={assetUrl("/assets/thick-logo.png")}
              alt="THICK. — non-dripping strained yogurt"
              width="2637"
              height="864"
            />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([label, href]) => (
              <a
                className={`nav-link ${label === "home" ? "active" : ""}`}
                href={href}
                key={label}
                aria-current={label === "home" ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button search-button"
              aria-label="Search yogurt"
              onClick={() => setOverlay("search")}
            >
              <Icon name="search" />
            </button>
            <a
              className="icon-button"
              href={store.phoneHref}
              aria-label="Call THICK."
            >
              <Icon name="phone" />
            </a>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="hero" aria-label="Welcome to THICK. yogurt">
          <video
            ref={video}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={assetUrl("/assets/hero-poster.jpg")}
            aria-hidden="true"
          >
            <source src={assetUrl("/assets/hero.mp4")} type="video/mp4" />
          </video>
          <h1 className="visually-hidden">THICK. non-dripping strained yogurt</h1>
          <button className="film-toggle" aria-label={videoPaused || reduceMotion ? "Play brand film" : "Pause brand film"}
            onClick={() => { if (videoPaused || reduceMotion) { setReduceMotion(false); setVideoPaused(false); video.current?.play().catch(() => {}); } else { setVideoPaused(true); video.current?.pause(); } }}>
            {videoPaused || reduceMotion ? "▶ Play film" : "Ⅱ Pause film"}
          </button>
        </section>
        <div className="hero-caption page-width">
          <p>Non-dripping strained yogurt.<span>A little slower. A little thicker.</span></p>
          <a className="pill" href="#featured-yogurt">Explore our yogurt <span>↓</span></a>
        </div>
        <section className="featured-section page-width" id="featured-yogurt" aria-labelledby="featured-title">
          <div className="section-heading"><div><p className="eyebrow">FIND YOUR FIRST SPOONFUL</p><h2 id="featured-title">Start with something good.</h2></div><a className="editorial-link" href="#yogurt">See the menu ↗</a></div>
          <div className="featured-grid">{featuredProducts.map((product, index) => (
            <article className="featured-card" key={product.id}>
              <button className="featured-image" onClick={() => selectProduct(product)} aria-label={`Take a closer look at ${product.title.toLowerCase()}`}>
                <span className="image-number">0{index + 1} / {product.series.toUpperCase()}</span>
                <img src={product.images[0].src} alt={product.images[0].alt} loading="lazy" style={{clipPath: product.images[0].clipPath}} />
                <span className="image-arrow" aria-hidden="true">↗</span>
              </button>
              <div className="featured-copy"><h3>{product.title}</h3><button className="editorial-link" onClick={() => selectProduct(product)}>Closer look ↗</button></div>
            </article>
          ))}</div>
        </section>
        <section className="craft-section" id="about-thick" aria-labelledby="craft-title">
          <div className="craft-layout page-width">
            <div className="craft-art"><span className="eyebrow">THE ART OF A GOOD SPOONFUL</span><img src={productById("remix-honey-bloom").images[0].src} alt={productById("remix-honey-bloom").images[0].alt} loading="lazy" /><span className="craft-footnote">Made for your little moment.</span></div>
            <div className="craft-text"><p className="eyebrow">A CLOSER LOOK</p><h2 id="craft-title">Why so<br /><em>THICK?</em></h2><p>Meet our non-dripping strained yogurt. A bowl to pause for, a spoonful to make your own.</p><div className="craft-fact"><span>01 / THE YOGURT</span><p>Strained yogurt. The heart of every bowl.</p></div><div className="craft-fact"><span>02 / YOUR MOMENT</span><p>Find your bowl. Take your time.</p></div><a className="editorial-link" href="#our-store">Come try a spoonful ↗</a></div>
          </div>
        </section>
        <section className="bao-section" id="meet-bao" aria-labelledby="bao-title">
          <div className="bao-layout page-width"><div className="bao-copy"><p className="eyebrow">A LITTLE COMPANY</p><h2 id="bao-title">Meet Bao.</h2><p>A small friend.<br />A very serious spoon.</p><a className="pill outline-pill" href="#yogurt">Find a spoonful together ↗</a></div><div className="bao-stage">
          <span className={`bao-bubble ${baoHello ? "visible" : ""}`} role="status" aria-live="polite">{baoHello ? "hi, spoon friend." : ""}</span>
          <button className="bao-touch" aria-label="Say hello to Bao" aria-pressed={baoHello} onClick={() => setBaoHello(!baoHello)}
            onPointerMove={(event) => { if (reduceMotion || event.pointerType === "touch") return; const box = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.transform = `rotate(${((event.clientX - box.left) / box.width - .5) * 10}deg)`; }}
            onPointerLeave={(event) => { event.currentTarget.style.transform = ""; }}><img src={assetUrl("/assets/bao.png")} alt="Bao holding a blue spoon" loading="lazy" /></button><p className="bao-hint">Tap Bao. Say hello.</p>
          </div></div>
        </section>

        <MenuSection onSelect={selectProduct} />
        <section
          className="story-section"
          id="our-store"
          aria-labelledby="story-title"
        >
          <div className="story page-width">
            <div className="story-photo">
              <img
                src={assetUrl("/assets/thick-store.png")}
                alt="THICK. storefront with a blue sign and outdoor seating in Washington, DC"
                width="1030"
                height="1526"
                loading="lazy"
              />
            </div>
            <div className="story-content">
              <span className="store-eyebrow">OUR STORE · WASHINGTON, DC</span>
              <h2 id="story-title">Your next<br />yogurt stop.</h2>
              <dl className="store-details">
                <div>
                  <dt>Address</dt>
                  <dd>
                    <address>
                      {store.street}, {store.unit}
                      <br />
                      {store.city}
                    </address>
                  </dd>
                </div>
                <div>
                  <dt>Hours</dt>
                  <dd>
                    {store.hours.days}
                    <br />
                    <time dateTime={store.hours.opens}>
                      {store.hours.opensLabel}
                    </time>
                    {" – "}
                    <time dateTime={store.hours.closes}>
                      {store.hours.closesLabel}
                    </time>
                    <span className="soft-opening-note">
                      Soft opening through {store.softOpening.through}:{" "}
                      {store.softOpening.label}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={store.phoneHref}>{store.phone}</a>
                  </dd>
                </div>
              </dl>
              <div className="store-actions">
                <a
                  className="button"
                  href={storeDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GET DIRECTIONS
                </a>
                <a className="button store-call" href={store.phoneHref}>
                  CALL THE STORE
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="page-width footer-top">
          <div className="footer-brand">
            <img
              src={assetUrl("/assets/thick-bowl-cream.png")}
              alt="THICK. bowl mark"
              width="853"
              height="644"
              loading="lazy"
            />
          </div>
          {footerGroups.map((group) => (
            <div className="footer-column" key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <a className={label === "Home" ? "active" : ""} href={href}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="page-width footer-bottom">
          <div className="legal">
            <span>
              © {new Date().getFullYear()}{" "}
              <a href={homeUrl}>{store.company}</a>
            </span>
            <span>THICK. · Non-dripping strained yogurt</span>
          </div>
        </div>
      </footer>
      <button
        className="accessibility-button"
        aria-label="Accessibility options"
        onClick={() => setOverlay("accessibility")}
      >
        <Icon name="person" />
      </button>
      {overlay === "menu" && (
        <Modal
          label="Main navigation"
          className="menu-dialog"
          onClose={() => setOverlay(null)}
        >
          <nav className="mobile-nav">
            {nav.map(([label, href]) => (
              <a
                key={label}
                className={label === "home" ? "active" : ""}
                href={href}
                onClick={() => setOverlay(null)}
              >
                {label}
              </a>
            ))}
            <button onClick={() => setOverlay("search")}>
              <Icon name="search" /> Search yogurt
            </button>
            <a href={store.phoneHref}>
              <Icon name="phone" /> {store.phone}
            </a>
          </nav>
        </Modal>
      )}
      {overlay === "search" && (
        <Modal
          label="Search yogurt"
          className="search-dialog"
          onClose={() => setOverlay(null)}
        >
          <h2>Search yogurt</h2>
          <div className="search-input-wrap">
            <input
              type="search"
              aria-label="Search yogurt"
              autoFocus
              placeholder="Search our yogurt bowls"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Icon name="search" />
          </div>
          <p className="search-caption">
            {query
              ? `${searchResults.length} results`
              : "Explore our yogurt bowls"}
          </p>
          <div className="search-results">
            {searchResults.map((product) => (
              <button key={product.id} onClick={() => selectProduct(product)}>
                <img
                  src={product.images[0].src}
                  alt=""
                  style={{ clipPath: product.images[0].clipPath }}
                />
                <span>
                  {product.title}
                  <small>THICK. {product.series}</small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
            {searchResults.length === 0 && (
              <p>Nothing on the menu matches. Try “strawberry” or “mango”.</p>
            )}
          </div>
        </Modal>
      )}
      {selected && (
        <Modal
          label={selected.title}
          className="product-dialog"
          onClose={() => setSelected(null)}
        >
          <div className="product-detail-image">
            <img
              src={selected.images[0].src}
              alt={selected.images[0].alt}
              style={{ clipPath: selected.images[0].clipPath }}
            />
          </div>
          <div className="product-detail-copy">
            <p className="eyebrow">THICK. / {selected.series.toUpperCase()}</p>
            <h2>{selected.title}</h2>
            {selected.price && <p className="detail-price">{selected.price}</p>}
            <p>{selected.images[0].alt}.</p>
            <p className="menu-note">
              {selected.price ? "On our soft opening menu." : "For today’s prices, call " + store.phone + "."}
            </p>
            <a className="button yogurt-call" href={store.phoneHref}>
              CALL THE STORE
            </a>
            <a
              className="detail-link"
              href="#our-store"
              onClick={() => setSelected(null)}
            >
              Visit our store <Icon name="arrow" />
            </a>
          </div>
        </Modal>
      )}
      {softOpening && (
        <Modal
          label="THICK. soft opening"
          className="soft-opening-dialog"
          onClose={closeSoftOpening}
        >
          <SoftOpeningSlides />
          <div className="soft-opening-copy">
            <div>
              <p className="eyebrow">NOW OPEN · GEORGETOWN, DC</p>
              <h2>Soft opening</h2>
              <p className="soft-opening-hours">
                Now – {store.softOpening.through} · {store.softOpening.label}
              </p>
            </div>
            <div className="soft-opening-actions">
              <a className="button" href="#our-store" onClick={closeSoftOpening}>
                VISIT OUR STORE
              </a>
              <button className="pill" onClick={closeSoftOpening}>
                Enter site
              </button>
            </div>
          </div>
        </Modal>
      )}
      {overlay === "accessibility" && (
        <Modal
          label="Accessibility options"
          className="preferences-dialog"
          onClose={() => setOverlay(null)}
        >
          <h2>Accessibility options</h2>
          <label className="preference-row">
            <span>Larger text</span>
            <input
              type="checkbox"
              checked={largeText}
              onChange={(e) => setLargeText(e.target.checked)}
            />
          </label>
          <label className="preference-row">
            <span>Higher contrast</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
          </label>
          <label className="preference-row">
            <span>Reduce motion / pause video</span>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
          </label>
          <button
            className="button"
            onClick={() => {
              setLargeText(false);
              setHighContrast(false);
              setReduceMotion(false);
            }}
          >
            Reset settings
          </button>
        </Modal>
      )}
    </div>
  );
}
