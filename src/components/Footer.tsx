import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="p-1.5 bg-brand-purple text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Aura</span>
            </Link>
            <p className="text-sm max-w-sm">
              Empowering women worldwide to access funded academic scholarship schemes, professional fellowships, hackathons, and STEM programs in one unified environment.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore" className="hover:text-white transition-colors">Explore Opps</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/saved" className="hover:text-white transition-colors">Saved Opps</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Profile Setup</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-850 mt-12 pt-6 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aura Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for women in technology
          </p>
        </div>
      </div>
    </footer>
  );
}
