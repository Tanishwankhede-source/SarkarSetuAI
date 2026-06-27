"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CITIZEN_LINKS = [
  { href: "/dashboard", label: "मुख्यपृष्ठ", labelEn: "Home" },
  { href: "/benefits", label: "योजना", labelEn: "Schemes" },
  { href: "/benefits/missed", label: "चुकलेले लाभ", labelEn: "Missed Benefits" },
  { href: "/applications", label: "अर्ज", labelEn: "Applications" },
  { href: "/advocate", label: "अपील", labelEn: "Appeal" },
  { href: "/agents", label: "प्रणाली नोंद", labelEn: "System Log" },
];

interface Props {
  variant?: "public" | "citizen";
  onLogout?: () => void;
}

export default function GovHeader({ variant = "public", onLogout }: Props) {
  const path = usePathname();

  return (
    <header className="gov-header">
      {/* Tricolour strip */}
      <div className="tricolor-strip" aria-hidden="true">
        <span className="tricolor-saffron" />
        <span className="tricolor-white" />
        <span className="tricolor-green" />
      </div>

      {/* Utility bar */}
      <div className="gov-utility-bar">
        <div className="gov-container flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Government of India | भारत सरकार
            </a>
            <span className="hidden sm:inline text-white/70">|</span>
            <span className="text-white/90">Citizen Welfare Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="hover:underline" title="Increase font size">A+</button>
            <button type="button" className="hover:underline" title="Decrease font size">A-</button>
            <span className="text-white/70">|</span>
            <Link href="/login" className="hover:underline">English</Link>
            <span className="text-white/70">|</span>
            <Link href="/login" className="hover:underline">मराठी</Link>
          </div>
        </div>
      </div>

      {/* Logo band */}
      <div className="gov-logo-band">
        <div className="gov-container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href={variant === "citizen" ? "/dashboard" : "/"} className="flex items-start gap-4 no-underline">
            <div className="gov-emblem" aria-hidden="true">
              <span className="text-[10px] font-bold leading-tight text-gov-navy">GOI</span>
            </div>
            <div>
              <p className="font-devanagari text-lg font-semibold leading-snug text-gov-navy sm:text-xl">
                सरकारसेतु — नागरिक कल्याण मंच
              </p>
              <p className="text-base font-semibold text-gov-navy sm:text-lg">SarkarSetu — Citizen Welfare Portal</p>
              <p className="mt-0.5 text-xs text-gray-600">Ministry of Social Justice &amp; Empowerment (Demo)</p>
            </div>
          </Link>
          {variant === "public" ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/government/dashboard" className="gov-btn-outline text-sm">
                Government Dashboard
              </Link>
              <Link href="/login" className="gov-btn-primary text-sm">
                Citizen Login
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="gov-btn-outline text-sm">Public Home</Link>
              {onLogout && (
                <button type="button" onClick={onLogout} className="gov-btn-outline text-sm">
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="gov-main-nav" aria-label="Main navigation">
        <div className="gov-container">
          {variant === "citizen" ? (
            <ul className="flex flex-wrap">
              {CITIZEN_LINKS.map(({ href, labelEn }) => {
                const active = path === href || (href !== "/dashboard" && path.startsWith(href));
                return (
                  <li key={href}>
                    <Link href={href} className={`gov-nav-link ${active ? "gov-nav-link-active" : ""}`}>
                      {labelEn}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="flex flex-wrap">
              <li><a href="#services" className="gov-nav-link">Services</a></li>
              <li><a href="#schemes" className="gov-nav-link">Schemes</a></li>
              <li><a href="#how-it-works" className="gov-nav-link">How It Works</a></li>
              <li><Link href="/government/dashboard" className="gov-nav-link">For Government</Link></li>
              <li><Link href="/login" className="gov-nav-link">Citizen Login</Link></li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
