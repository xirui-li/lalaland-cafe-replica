/** Apply a consistent blue duotone without changing the original media files. */
export default function ThemeFilters() {
  return (
    <svg
      className="theme-filters"
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="brand-tone" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.027 0.086 0.24 0.5451 0.973" />
            <feFuncG type="table" tableValues="0.08 0.235 0.46 0.7451 0.985" />
            <feFuncB type="table" tableValues="0.129 0.361 0.64 0.9098 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
