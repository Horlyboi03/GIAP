import { Link } from 'react-router-dom'
import { Mail, Facebook, Instagram, Globe } from 'lucide-react'
import BrandLogo from './BrandLogo'

export default function Footer() {
  const applyPath = '/register'
  const supportEmail = 'maryygeorge193@gmail.com'
  const coordinatorName = 'Mary George'
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61573275546877',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/___agentmarygeorge?igsh=aHZvbHZwbmZob3Mw',
      icon: Instagram,
    },
  ]

  return (
    <footer className="bg-gradient-to-br from-primary-950 to-primary-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <BrandLogo
              className="mb-4"
              titleClassName="text-2xl font-bold text-white"
              subtitleClassName="text-sm text-gray-400"
            />
            <p className="text-gray-400 mb-6">
              Providing life-changing financial assistance to individuals, businesses, and communities worldwide since 2015.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/#about" className="hover:text-gold-400 transition-colors">About Us</a></li>
              <li><Link to={applyPath} className="hover:text-gold-400 transition-colors">Programs</Link></li>
              <li><a href="/#faq" className="hover:text-gold-400 transition-colors">FAQ</a></li>
              <li><a href="/#contact" className="hover:text-gold-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
            <div className="space-y-4 text-gray-400">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">Program Coordinator</p>
                <p className="mt-2 text-base font-semibold text-white">{coordinatorName}</p>
                <p className="text-sm text-gray-400">GIAP Team</p>
                <p className="text-sm text-gray-400">Program Coordinator</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <a href={`mailto:${supportEmail}`} className="hover:text-gold-400 transition-colors">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Global Headquarters</span>
              </div>
              <div className="space-y-3 pt-2">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    className="flex items-center space-x-2 hover:text-gold-400 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <p className="text-gray-500 text-sm">© 2024 GIAP. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <a href={`mailto:${supportEmail}`} className="hover:text-gold-400 transition-colors">Email Support</a>
            <a href="/#contact" className="hover:text-gold-400 transition-colors">Contact Form</a>
            <Link to={applyPath} className="hover:text-gold-400 transition-colors">Apply Now</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
