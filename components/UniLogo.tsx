type Props = {
  logo: string;
  alt?: string;
  className?: string;
  textClassName?: string;
};

/**
 * Renders a university logo. The DB field stores either:
 *  - a short text/letter (seeded universities, e.g. "W", "TIIAME")
 *  - an uploaded filename (e.g. "abc-123.png") served via /api/files/...
 *  - a public path starting with "/"
 */
export function UniLogo({ logo, alt = "", className, textClassName }: Props) {
  const isImage = logo.startsWith("/") || /\.(jpe?g|png|webp|svg)$/i.test(logo);
  if (isImage) {
    const src = logo.startsWith("/") ? logo : `/api/files/${logo}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    );
  }
  return <span className={textClassName}>{logo}</span>;
}
