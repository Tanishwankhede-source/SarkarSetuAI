import Link from "next/link";

export default function GovFooter() {
  const year = new Date().getFullYear();
  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <footer className="gov-footer mt-auto">
      <div className="gov-container py-8">
        <div className="grid gap-6 border-b border-gray-300 pb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="gov-footer-heading">Quick Links</h3>
            <ul className="gov-footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/login">Citizen Login</Link></li>
              <li><Link href="/government/dashboard">Government Dashboard</Link></li>
              <li><a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer">India.gov.in</a></li>
            </ul>
          </div>
          <div>
            <h3 className="gov-footer-heading">Policies</h3>
            <ul className="gov-footer-links">
              <li><a href="#">Terms of Use</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Accessibility</a></li>
              <li><a href="#">Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h3 className="gov-footer-heading">Help &amp; Support</h3>
            <ul className="gov-footer-links">
              <li><a href="#">User Manual</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><span>Helpline: 1800-XXX-XXXX</span></li>
            </ul>
          </div>
          <div>
            <h3 className="gov-footer-heading">Citizen Services</h3>
            <ul className="gov-footer-links">
              <li><Link href="/benefits">Scheme Discovery</Link></li>
              <li><Link href="/benefits/missed">Missed Benefits</Link></li>
              <li><Link href="/applications">Track Application</Link></li>
              <li><Link href="/advocate">Appeal Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Last Updated: {lastUpdated} | Site best viewed in Chrome, Firefox, Edge</p>
          <p>© {year} SarkarSetu Citizen Welfare Portal. All rights reserved.</p>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Designed &amp; Developed for Agentic Arena 2026 Demo. Content is for demonstration purposes.
        </p>
      </div>
    </footer>
  );
}
