import { useEffect, useRef, useState, type ReactNode } from "react";
import catalogData from "./catalog.json";
import ThemeFilters from "./ThemeFilters";

const homeUrl = import.meta.env.BASE_URL;
const assetUrl = (path: string) => `${homeUrl}${path.replace(/^\//, "")}`;
const catalog = catalogData.map((collection) => ({
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
type CartItem = { id: string; quantity: number };
type Overlay =
  | "cart"
  | "search"
  | "menu"
  | "preferences"
  | "accessibility"
  | null;
const allProducts = catalog.flatMap((collection) => collection.products);
const official = (path: string) => `https://lalalandcafe.com${path}`;
const orderUrl = "https://order.lalalandcafe.com/";
const nav = [
  ["home", homeUrl],
  ["order now", orderUrl],
  ["menu", official("/pages/menu")],
  ["locations", official("/pages/locations")],
  ["shop", "#shop"],
  ["our story", official("/pages/about-us")],
  ["rewards", official("/pages/rewards")],
  ["careers", official("/pages/careers")],
];
const shopGroups = [
  { title: "New Arrivals", href: "#new-arrivals", children: [] },
  { title: "Shop All", href: official("/collections/shop-all"), children: [] },
  { title: "All Coffee and Tea", href: "#all-coffee", children: [] },
  {
    title: "All Apparel",
    href: official("/collections/apparel"),
    children: [["Hats", "/collections/hats"]],
  },
  {
    title: "All Drinkware",
    href: official("/collections/drinkware"),
    children: [
      ["Ceramics", "/collections/ceramics"],
      ["Travel Mugs", "/collections/mugs"],
    ],
  },
  {
    title: "All Accessories",
    href: official("/collections/accessories"),
    children: [
      ["Jewelry", "/collections/jewelry"],
      ["Magnets", "/collections/magnets"],
      ["Keychains", "/collections/keychains"],
      ["Enamel Pins", "/collections/enamel-pins"],
    ],
  },
  {
    title: "Home and Fragrance",
    href: official("/collections/home-and-fragrance"),
    children: [["Candles", "/collections/candles"]],
  },
  { title: "Gift Cards", href: official("/pages/gift-cards"), children: [] },
];
const footerGroups = [
  {
    title: "Company",
    links: [
      ["Home", "/"],
      ["Menu", "/pages/menu"],
      ["Ordering", "/pages/ordering"],
      ["Rewards", "/pages/rewards"],
      ["Locations", "/pages/locations"],
      ["Careers", "/pages/careers"],
    ],
  },
  {
    title: "Shop",
    links: [
      ["Coffee", "/collections/at-home-coffee-and-tea"],
      ["Apparel", "/collections/apparel"],
      ["Drinkware", "/collections/drinkware"],
      ["Accessories", "/collections/accessories"],
      ["Home & Fragrance", "/collections/home-and-fragrance"],
      ["Gift Cards", "/pages/gift-cards"],
    ],
  },
  {
    title: "Learn",
    links: [
      ["Our Story", "/pages/about-us"],
      ["Collaborations", "/pages/collaborations"],
      ["FAQ", "/pages/faq"],
      ["Sustainability", "/pages/sustainability"],
      ["Allergens", "/pages/allergens"],
      ["Contact Us", "/pages/contact"],
    ],
  },
];

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
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
      active?.focus();
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
  title,
  products,
  onSelect,
}: {
  title: string;
  products: Product[];
  onSelect: (p: Product) => void;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(2);
  const id = title === "New Arrivals" ? "new-arrivals" : "all-coffee";
  useEffect(() => {
    const el = track.current!;
    const update = () => {
      const card = el.firstElementChild as HTMLElement;
      const step = card.offsetWidth + parseFloat(getComputedStyle(el).gap);
      const max = Math.ceil((el.scrollWidth - el.clientWidth) / step) + 1;
      setTotal(max);
      setPage(Math.min(max, Math.round(el.scrollLeft / step) + 1));
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
      </div>
      <ul className="product-track" ref={track} aria-label={title}>
        {products.map((product) => (
          <li className="product-card" key={product.id}>
            <a
              className="product-link"
              href={official(product.href)}
              onClick={(e) => {
                e.preventDefault();
                onSelect(product);
              }}
            >
              <div className="product-image">
                {product.images[0] ? (
                  <img
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.title}
                    loading="lazy"
                    width="900"
                    height="900"
                  />
                ) : (
                  <div className="text-product">{product.title}</div>
                )}
                {product.images[1] && (
                  <img
                    className="product-hover"
                    src={product.images[1].src}
                    alt=""
                    loading="lazy"
                    width="900"
                    height="900"
                  />
                )}
                {product.soldOut && <span className="sold-out">Sold out</span>}
              </div>
              <div className="product-info">
                <h3>{product.title}</h3>
                <p>{product.price}</p>
              </div>
            </a>
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
    </section>
  );
}

function readCart(): CartItem[] {
  try {
    const value = JSON.parse(
      localStorage.getItem("lalaland-preview-cart") || "[]",
    );
    return Array.isArray(value)
      ? value
          .filter(
            (i) =>
              allProducts.some((p) => p.id === i.id) &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0,
          )
          .map((i) => ({ id: i.id, quantity: Math.min(i.quantity, 99) }))
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [productImage, setProductImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [newsletterNotice, setNewsletterNotice] = useState("");
  const [cookieVisible, setCookieVisible] = useState(() => {
    try {
      return !localStorage.getItem("lalaland-cookie-choice");
    } catch {
      return true;
    }
  });
  const [analytics, setAnalytics] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const header = useRef<HTMLElement>(null);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(
        allProducts.find((p) => p.id === item.id)!.price.replace(/[^\d.]/g, ""),
      ) *
        item.quantity,
    0,
  );
  const searchResults = allProducts.filter((p) =>
    `${p.title} ${catalog.find((c) => c.products.some((item) => item.id === p.id))?.title}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    try {
      localStorage.setItem("lalaland-preview-cart", JSON.stringify(cart));
    } catch {
      /* Storage can be disabled. */
    }
  }, [cart]);
  useEffect(() => {
    let previous = window.scrollY;
    const scroll = () => {
      const y = window.scrollY;
      setHeaderHidden(y > 150 && y > previous && !shopOpen);
      previous = y;
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, [shopOpen]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (header.current && !header.current.contains(e.target as Node))
        setShopOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShopOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
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
  const chooseCookie = (choice: string) => {
    try {
      localStorage.setItem("lalaland-cookie-choice", choice);
    } catch {}
    setCookieVisible(false);
    setOverlay(null);
  };
  const selectProduct = (p: Product) => {
    setOverlay(null);
    setSelected(p);
    setQuantity(1);
    setProductImage(0);
  };
  const addToCart = () => {
    if (!selected || selected.soldOut) return;
    setCart((items) => {
      const existing = items.find((i) => i.id === selected.id);
      return existing
        ? items.map((i) =>
            i.id === selected.id
              ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
              : i,
          )
        : [...items, { id: selected.id, quantity }];
    });
    setSelected(null);
    setOverlay("cart");
  };
  const updateQuantity = (id: string, change: number) =>
    setCart((items) =>
      items
        .map((i) =>
          i.id === id
            ? { ...i, quantity: Math.min(99, i.quantity + change) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  return (
    <div
      className={`site ${largeText ? "large-text" : ""} ${highContrast ? "high-contrast" : ""} ${reduceMotion ? "reduce-motion" : ""}`}
    >
      <ThemeFilters />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        <a href={official("/collections/shop-all")}>
          Free shipping over $100 <Icon name="arrow" />
        </a>
      </div>
      <header
        ref={header}
        className={`site-header ${headerHidden ? "is-hidden" : ""}`}
      >
        <div className="header-inner page-width">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open menu"
            onClick={() => setOverlay("menu")}
          >
            <Icon name="menu" />
          </button>
          <a className="brand" href={homeUrl} aria-label="La La Land home">
            <img
              src={assetUrl("/assets/logo-brown.png")}
              alt="lalaland"
              width="130"
              height="23"
            />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([label, href]) =>
              label === "shop" ? (
                <button
                  key={label}
                  className={`nav-link shop-toggle ${shopOpen ? "active" : ""}`}
                  aria-expanded={shopOpen}
                  aria-controls="shop-menu"
                  onClick={() => setShopOpen(!shopOpen)}
                >
                  shop <Icon name="chevron" />
                </button>
              ) : (
                <a
                  className={`nav-link ${label === "home" ? "active" : ""} ${label === "careers" ? "careers" : ""}`}
                  href={href}
                  key={label}
                  aria-current={label === "home" ? "page" : undefined}
                >
                  {label}
                </a>
              ),
            )}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button search-button"
              aria-label="Search"
              onClick={() => {
                setShopOpen(false);
                setOverlay("search");
              }}
            >
              <Icon name="search" />
            </button>
            <a
              className="icon-button account-button"
              aria-label="Log in"
              href={official("/account/login")}
            >
              <Icon name="account" />
            </a>
            <button
              className="icon-button bag-button"
              aria-label={`Your cart${count ? `, ${count} items` : ""}`}
              onClick={() => setOverlay("cart")}
            >
              <Icon name="bag" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
        {shopOpen && (
          <nav
            className="mega-menu"
            id="shop-menu"
            aria-label="Shop categories"
          >
            <div className="page-width mega-menu-grid">
              {shopGroups.map((group) => (
                <div key={group.title}>
                  <a
                    className="shop-group-title"
                    href={group.href}
                    onClick={() => setShopOpen(false)}
                  >
                    {group.title}
                  </a>
                  {group.children.map(([label, href]) => (
                    <a key={label} href={official(href)}>
                      {label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero" aria-label="Welcome to La La Land">
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
              WELCOME TO<span className="visually-hidden"> La La Land</span>
            </h1>
            <div className="hero-logo" role="img" aria-label="lalaland" />
            <a className="hero-button" href={orderUrl}>
              Order Now
            </a>
          </div>
        </section>
        {catalog.map((collection) => (
          <ProductCarousel
            key={collection.title}
            {...collection}
            onSelect={selectProduct}
          />
        ))}
        <section className="story-section" aria-labelledby="story-title">
          <div className="story page-width">
            <div className="story-photo">
              <img
                src={assetUrl("/assets/cafe.jpg")}
                alt="Neighbors gathering outside a sunny La La Land cafe"
                width="1500"
                height="1500"
                loading="lazy"
              />
            </div>
            <div className="story-content">
              <h2 id="story-title">More than just a coffee shop</h2>
              <p>
                We are a café committed to spreading kindness and serving
                top-quality coffee and delicious treats.{" "}
                <span className="mobile-story-copy">
                  We also offer job opportunities for foster youth.{" "}
                </span>
                To learn more about La La Land, please visit our website.
              </p>
              <a className="button" href="https://lalalandcares.com/">
                LEARN MORE
              </a>
            </div>
          </div>
        </section>
        <section className="app-section" aria-labelledby="app-title">
          <div className="app-content">
            <img
              className="app-illustration"
              src={assetUrl("/assets/app-icon.png")}
              alt="Order your cafe favorites on the La La Land app"
              width="216"
              height="216"
              loading="lazy"
            />
            <div className="app-copy">
              <h2 id="app-title">Your cafe favorites are just a tap away.</h2>
              <p>
                From your favorite La La Land Coffee to mid-afternoon snack,
                order ahead on the app.
              </p>
            </div>
          </div>
          <a
            className="button download-button"
            href="https://l.ead.me/La-La-Land-App"
          >
            DOWNLOAD NOW
          </a>
        </section>
        <section className="newsletter" aria-labelledby="newsletter-title">
          <h2 id="newsletter-title">Subscribe to our emails</h2>
          <p>
            Be the first to know about new collections and exclusive offers.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNewsletterNotice(
                "This is a website preview. Email subscriptions are not connected yet.",
              );
            }}
          >
            <div className="email-field">
              <input
                type="email"
                id="newsletter-email"
                name="email"
                placeholder=" "
                autoComplete="email"
                required
              />
              <label htmlFor="newsletter-email">Email</label>
              <button type="submit" aria-label="Subscribe">
                <Icon name="arrow" />
              </button>
            </div>
          </form>
          {newsletterNotice && (
            <p className="newsletter-notice" role="status">
              {newsletterNotice}
            </p>
          )}
        </section>
      </main>
      <footer className="footer">
        <div className="page-width footer-top">
          <div className="footer-brand">
            <img
              src={assetUrl("/assets/angel.png")}
              alt="La La Land angel"
              width="125"
              height="86"
              loading="lazy"
            />
          </div>
          {footerGroups.map((group) => (
            <div className="footer-column" key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      className={href === "/" ? "active" : ""}
                      href={href === "/" ? homeUrl : official(href)}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="page-width footer-bottom">
          <div className="payment-icons" aria-label="Accepted payment methods">
            {[
              "American Express",
              "Apple Pay",
              "Diners Club",
              "Discover",
              "Google Pay",
              "Mastercard",
              "PayPal",
              "Shop Pay",
              "Visa",
            ].map((name, i) => (
              <img
                key={name}
                src={assetUrl(`/assets/payment-${i}.svg`)}
                alt={name}
                width="38"
                height="24"
                loading="lazy"
              />
            ))}
          </div>
          <div className="legal">
            <span>
              © {new Date().getFullYear()}, <a href={homeUrl}>La La Land</a>
            </span>
            {[
              ["Refund policy", "refund-policy"],
              ["Privacy policy", "privacy-policy"],
              ["Terms of service", "terms-of-service"],
              ["Shipping policy", "shipping-policy"],
            ].map(([label, path]) => (
              <a key={path} href={official(`/policies/${path}`)}>
                {label}
              </a>
            ))}
            <button onClick={() => setOverlay("preferences")}>
              Cookie preferences
            </button>
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
      {cookieVisible && (
        <section className="cookie-banner" aria-labelledby="cookie-title">
          <h2 id="cookie-title">Cookie consent</h2>
          <p>
            We and our partners, including Shopify, use cookies and other
            technologies to personalize your experience, show you ads, and
            perform analytics, and we will not use cookies or other technologies
            for these purposes unless you accept them. Learn more in our{" "}
            <a href={official("/policies/privacy-policy")}>Privacy Policy</a>
          </p>
          <div className="cookie-actions">
            <button
              className="cookie-manage"
              onClick={() => setOverlay("preferences")}
            >
              Manage
              <br className="desktop-break" /> preferences
            </button>
            <button onClick={() => chooseCookie("accepted")}>Accept</button>
            <button onClick={() => chooseCookie("declined")}>Decline</button>
          </div>
        </section>
      )}
      {overlay === "menu" && (
        <Modal
          label="Main navigation"
          className="menu-dialog"
          onClose={() => setOverlay(null)}
        >
          <nav className="mobile-nav">
            {nav.map(([label, href]) =>
              label === "shop" ? (
                <details key={label}>
                  <summary>
                    shop <Icon name="chevron" />
                  </summary>
                  <div className="mobile-shop">
                    {shopGroups.map((group) => (
                      <a
                        key={group.title}
                        href={group.href}
                        onClick={() => setOverlay(null)}
                      >
                        {group.title}
                      </a>
                    ))}
                  </div>
                </details>
              ) : (
                <a
                  key={label}
                  className={`${label === "home" ? "active" : ""} ${label === "careers" ? "careers" : ""}`}
                  href={href}
                  onClick={() => setOverlay(null)}
                >
                  {label}
                </a>
              ),
            )}
            <button onClick={() => setOverlay("search")}>
              <Icon name="search" /> Search
            </button>
            <a className="mobile-login" href={official("/account/login")}>
              <Icon name="account" /> Log in
            </a>
          </nav>
        </Modal>
      )}
      {overlay === "search" && (
        <Modal
          label="Search products"
          className="search-dialog"
          onClose={() => setOverlay(null)}
        >
          <h2>Search</h2>
          <div className="search-input-wrap">
            <input
              type="search"
              aria-label="Search products"
              autoFocus
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Icon name="search" />
          </div>
          <p className="search-caption">
            {query
              ? `${searchResults.length} results`
              : "Explore our favorites"}
          </p>
          <div className="search-results">
            {searchResults.map((product) => (
              <button key={product.id} onClick={() => selectProduct(product)}>
                {product.images[0] ? (
                  <img src={product.images[0].src} alt="" />
                ) : (
                  <span className="search-placeholder">
                    <Icon name="bag" />
                  </span>
                )}
                <span>
                  {product.title}
                  <small>{product.price}</small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
            {searchResults.length === 0 && (
              <p>No products found. Try “coffee”, “matcha”, or “tumbler”.</p>
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
            {selected.images[productImage] ? (
              <img
                src={selected.images[productImage].src}
                alt={selected.title}
              />
            ) : (
              <div className="text-product">{selected.title}</div>
            )}
            {selected.images.length > 1 && (
              <div className="image-dots">
                {selected.images.map((_, i) => (
                  <button
                    key={i}
                    className={i === productImage ? "selected" : ""}
                    aria-label={`Product image ${i + 1}`}
                    aria-pressed={i === productImage}
                    onClick={() => setProductImage(i)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="product-detail-copy">
            <p className="eyebrow">LA LA LAND</p>
            <h2>{selected.title}</h2>
            <p>{selected.price}</p>
            <p className="shipping-note">Shipping calculated at checkout.</p>
            <label className="quantity-label">Quantity</label>
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Icon name="minus" />
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= 99}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Icon name="plus" />
              </button>
            </div>
            <button
              className="button add-to-cart"
              disabled={selected.soldOut}
              onClick={addToCart}
            >
              {selected.soldOut ? "Sold out" : "Add to cart"}
            </button>
            <a className="detail-link" href={official(selected.href)}>
              View full details <Icon name="arrow" />
            </a>
          </div>
        </Modal>
      )}
      {overlay === "cart" && (
        <Modal
          label="Your cart"
          className="cart-dialog"
          onClose={() => setOverlay(null)}
        >
          {count === 0 ? (
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <button
                className="button"
                onClick={() => {
                  setOverlay(null);
                  document
                    .getElementById("new-arrivals")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Continue shopping
              </button>
              <h3>Have an account?</h3>
              <p>
                <a href={official("/account/login")}>Log in</a> to check out
                faster.
              </p>
            </div>
          ) : (
            <>
              <h2>Your cart</h2>
              <div className="cart-items">
                {cart.map((item) => {
                  const p = allProducts.find(
                    (product) => product.id === item.id,
                  )!;
                  return (
                    <div className="cart-item" key={item.id}>
                      {p.images[0] ? (
                        <img src={p.images[0].src} alt={p.title} />
                      ) : (
                        <span className="search-placeholder">
                          <Icon name="bag" />
                        </span>
                      )}
                      <div>
                        <h3>{p.title}</h3>
                        <p>{p.price}</p>
                        <div className="quantity-control">
                          <button
                            aria-label={`Remove one ${p.title}`}
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Icon name="minus" />
                          </button>
                          <output>{item.quantity}</output>
                          <button
                            aria-label={`Add one ${p.title}`}
                            disabled={item.quantity >= 99}
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Icon name="plus" />
                          </button>
                        </div>
                        <button
                          className="remove-item"
                          onClick={() =>
                            setCart((items) =>
                              items.filter((i) => i.id !== item.id),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="cart-summary">
                <div>
                  <h3>Estimated total</h3>
                  <p>${subtotal.toFixed(2)} USD</p>
                </div>
                <p>Taxes, discounts and shipping calculated at checkout.</p>
                <button
                  className="button"
                  onClick={() =>
                    setNotice(
                      "This is a local preview. Checkout is not connected to a payment provider.",
                    )
                  }
                >
                  Check out
                </button>
                {notice && (
                  <p className="checkout-notice" role="status">
                    {notice}
                  </p>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
      {overlay === "preferences" && (
        <Modal
          label="Cookie preferences"
          className="preferences-dialog"
          onClose={() => setOverlay(null)}
        >
          <h2>Cookie preferences</h2>
          <p>
            Choose which cookies you allow. This local preview stores your
            preferences and shopping bag on this device; it does not run
            advertising or analytics trackers.
          </p>
          <div className="preference-row">
            <span>
              Essential storage
              <small>Remembers your shopping bag and preferences.</small>
            </span>
            <span>Always active</span>
          </div>
          <label className="preference-row">
            <span>
              Analytics and marketing
              <small>Optional cookies for a connected storefront.</small>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </label>
          <button
            className="button"
            onClick={() => chooseCookie(analytics ? "accepted" : "essential")}
          >
            Save preferences
          </button>
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
      {notice && overlay !== "cart" && (
        <div className="toast" role="status">
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
