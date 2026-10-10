import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowUp,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setIsSubscribed(true);
    showToast('Subscribed to CollabX Research Digest!', 'success');
    setNewsletterEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B2A55] text-white pt-14 pb-8 border-t border-[#0A1F44]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-xs flex flex-col">
                <div className="h-1/2 bg-[#E53935]" />
                <div className="h-1/2 bg-white" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-[#0B2A55]" />
                <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-white border border-[#0B2A55] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#FFC83D]" />
                </div>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Collab<span className="text-[#FFC83D]">X</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              CollabX brings students, researchers and supervisors into one place to discover, connect and collaborate on transformative research.
            </p>
            <p className="text-xs text-[#FFC83D] font-medium tracking-wide">
              Research Ideas · Connect People · Build the Future
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {['Facebook', 'LinkedIn', 'GitHub', 'X', 'YouTube'].map((social) => (
                <button
                  key={social}
                  onClick={() => showToast(`Opening CollabX ${social}`, 'info')}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#0B6BE6] flex items-center justify-center text-xs text-white transition-all cursor-pointer"
                  title={social}
                >
                  {social.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white tracking-wide border-l-3 border-[#FFC83D] pl-2.5">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/research-areas')} className="hover:text-white transition-colors cursor-pointer">
                  Research Areas
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/projects')} className="hover:text-white transition-colors cursor-pointer">
                  Projects Catalog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/papers')} className="hover:text-white transition-colors cursor-pointer">
                  Research Papers Library
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/ai-writer')} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                  <span>AI Paper Writer</span>
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded-sm">AI</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white tracking-wide border-l-3 border-[#0E9F6E] pl-2.5">
              Support & Policies
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Help Center / FAQ
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Report a Problem
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  Academic Integrity Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  Submission Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy & Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white tracking-wide border-l-3 border-[#0B6BE6] pl-2.5">
              Contact & Digest
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FFC83D] shrink-0 mt-0.5" />
                <span>Port City International University, Chattogram, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FFC83D] shrink-0" />
                <span>support.cse@portcity.edu.bd</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FFC83D] shrink-0" />
                <span>+880 31 2869877</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFC83D] shrink-0" />
                <span>Sun – Thu: 9:00 AM – 5:00 PM</span>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-200 mb-2">Subscribe to Research Newsletter</p>
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter university email..."
                  className="bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs px-3 py-2 rounded-lg focus:outline-hidden focus:border-[#FFC83D] flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#0B6BE6] hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              {isSubscribed && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} CollabX. Built for DBMS Sessional CSE 222, Port City International University.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/about')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Academic License
            </button>
            <span>·</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#FFC83D] hover:underline cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
