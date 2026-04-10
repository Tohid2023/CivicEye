import React from "react";
import { Link } from "react-router-dom";
import { Shield, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900">CivicEye</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Empowering communities with digital oversight and reliable local help for a better tomorrow.
          </p>
        </div>

        <div className="flex gap-8 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">Safety</Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">Privacy</Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">Terms</Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <Shield className="text-blue-600" size={16} />
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Community Verified 
          </span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CivicEye. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;