/**
 * The "b1ttada" brand wordmark with an italic red "1".
 * Mirrors the design from Landing Page.html / landing.jsx.
 */
export function Wordmark({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`wordmark ${className}`}
      style={{ fontSize: size }}
      aria-label="Bittada"
    >
      b<span className="one">1</span>ttada
    </span>
  );
}
