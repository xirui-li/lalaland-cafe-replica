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
  products: { id: string; title: string; images: ProductImage[] }[];
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
const nav = [
  ["home", homeUrl],
  ["our yogurt", "#yogurt"],
  ["about THICK.", "#about-thick"],
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

function ProductCarousel({
  id,
  title,
  products,
  onSelect,
}: {
  id: string;
  title: string;
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  useEffect(() => {
    const el = track.current!;
    const update = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + parseFloat(getComputedStyle(el).gap);
      const max = Math.max(
        1,
        Math.ceil((el.scrollWidth - el.clientWidth) / step) + 1,
      );
      setTotal(max);
      setPage(
        el.scrollLeft >= el.scrollWidth - el.clientWidth - 2
          ? max
          : Math.min(max, Math.round(el.scrollLeft / step) + 1),
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);
  const move = (direction: number) => {
    const el = track.current!;
    const step =
      (el.firstElementChild as HTMLElement).offsetWidth +
      parseFloat(getComputedStyle(el).gap);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };
  return (
    <section className="collection" id={id} aria-labelledby={`${id}-title`}>
      <div className="page-width collection-title">
        <h2 id={`${id}-title`}>{title}</h2>
        <p className="collection-intro">
          A look at our non-dripping strained yogurt bowls.
        </p>
      </div>
      <ul className="product-track" ref={track} aria-label={title}>
        {products.map((product) => (
          <li className="product-card" key={product.id}>
            <button
              className="product-link"
              onClick={() => onSelect(product)}
              aria-label={`View ${product.title.toLowerCase()}`}
            >
              <div className="product-image">
                <img
                  src={product.images[0].src}
                  alt={product.images[0].alt}
                  style={{ clipPath: product.images[0].clipPath }}
                  loading="lazy"
                  width="1254"
                  height="1254"
                />
              </div>
              <div className="product-info">
                <h3>{product.title}</h3>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <div className="carousel-controls">
        <button
          className="icon-button previous"
          aria-label={`Previous ${title.toLowerCase()}`}
          onClick={() => move(-1)}
          disabled={page <= 1}
        >
          <Icon name="chevron" />
        </button>
        <span aria-live="polite">
          {page} <span className="counter-slash">/</span> {total}
        </span>
        <button
          className="icon-button next"
          aria-label={`Next ${title.toLowerCase()}`}
          onClick={() => move(1)}
          disabled={page >= total}
        >
          <Icon name="chevron" />
        </button>
      </div>
      <p className="collection-note page-width">
        For today’s selection and prices,{" "}
        <a href={store.phoneHref}>call our store</a>.
      </p>
    </section>
  );
}

export default function App() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const searchResults = allProducts.filter((product) =>
    `${product.title} ${product.images[0].alt}`
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
    else video.current?.play().catch(() => {});
  }, [reduceMotion]);
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
          <div className="hero-content">
            <h1>
              WELCOME TO<span className="visually-hidden"> THICK. yogurt</span>
            </h1>
            <img
              className="hero-logo"
              src={assetUrl("/assets/thick-logo-cream.png")}
              alt="THICK. — non-dripping strained yogurt"
              width="2637"
              height="1028"
              fetchPriority="high"
            />
            <a className="hero-button" href="#yogurt">
              Explore our yogurt
            </a>
          </div>
        </section>
        {catalog.map((collection) => (
          <ProductCarousel
            key={collection.id}
            {...collection}
            onSelect={selectProduct}
          />
        ))}
        <section
          className="app-section"
          id="about-thick"
          aria-labelledby="about-title"
        >
          <div className="app-content">
            <img
              className="app-illustration"
              src={assetUrl("/assets/thick-bowl.png")}
              alt="THICK. bowl and spoon mark"
              width="853"
              height="644"
              loading="lazy"
            />
            <div className="app-copy">
              <h2 id="about-title">All about yogurt.</h2>
              <p>
                THICK. is all about non-dripping strained yogurt. Explore our
                bowls and make your next yogurt stop at our Washington, DC
                store.
              </p>
            </div>
          </div>
          <a className="button" href="#our-store">
            VISIT THICK.
          </a>
        </section>
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
              <h2 id="story-title">Visit {store.brand}</h2>
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
        <section className="newsletter" aria-labelledby="contact-title">
          <h2 id="contact-title">Your next yogurt stop.</h2>
          <p>
            Visit us every day, {store.hours.opensLabel}–
            {store.hours.closesLabel}.
          </p>
          <a className="button contact-button" href={store.phoneHref}>
            LET’S TALK YOGURT
          </a>
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
                  <small>THICK. yogurt</small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
            {searchResults.length === 0 && (
              <p>No yogurt bowls found. Try “yogurt” or “berries”.</p>
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
            <p className="eyebrow">THICK. YOGURT</p>
            <h2>{selected.title}</h2>
            <p>
              Non-dripping strained yogurt. Discover our bowls at our
              Washington, DC store.
            </p>
            <p className="menu-note">
              For today’s selection and prices, call {store.phone}.
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
