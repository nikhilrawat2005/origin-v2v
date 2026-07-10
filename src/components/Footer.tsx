import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface-footer text-foreground-muted border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="p-1.5 bg-primary text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Bloom</span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed">
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
              <li><Link href="/ai-hub" className="hover:text-white transition-colors">AI Hub</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Profile Setup</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Bloom Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> for women in technology
          </p>
        </div>
      </div>
    </footer>
  );
}
