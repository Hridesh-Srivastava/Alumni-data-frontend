import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-white">HSST Alumni</h3>
            <p className="mt-4 text-sm">
              Connecting graduates from the Himalayan School of Science and Technology, fostering a strong alumni
              network for professional growth and collaboration.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <address className="mt-4 not-italic text-sm">
              Swami Rama Himalayan University
              <br />
              Jolly Grant, Dehradun
              <br />
              Uttarakhand, India - 248016
              <br />
              <br />
              <a href="mailto:alumni@srhu.edu.in" className="hover:text-white">
                alumni@srhu.edu.in
              </a>
              <br />
              <a href="tel:+911352471100" className="hover:text-white">
                +91-135-2471100
              </a>
            </address>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} HSST Alumni Network. All rights reserved.</p>
          <p className="mt-2">A project of Swami Rama Himalayan University</p>
        </div>
      </div>
    </footer>
  )
}

