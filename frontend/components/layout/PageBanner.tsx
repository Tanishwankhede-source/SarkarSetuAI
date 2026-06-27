interface Props {
  title: string;
  titleHi?: string;
  subtitle?: string;
  image: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageBanner({ title, titleHi, subtitle, image, breadcrumbs }: Props) {
  return (
    <section
      className="gov-page-banner"
      style={{ backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.78), rgba(0, 51, 102, 0.78)), url(${image})` }}
    >
      <div className="gov-container py-8 sm:py-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="gov-breadcrumb mb-3" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label}>
                {i > 0 && <span className="mx-2 opacity-60">›</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:underline">{crumb.label}</a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {titleHi && (
          <h1 className="font-devanagari text-2xl font-semibold text-white sm:text-3xl">{titleHi}</h1>
        )}
        <h2 className={`font-semibold text-white ${titleHi ? "text-xl sm:text-2xl mt-1" : "text-2xl sm:text-3xl"}`}>
          {title}
        </h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">{subtitle}</p>}
      </div>
    </section>
  );
}
