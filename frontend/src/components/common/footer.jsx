import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#111F35] text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">

                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold text-white">ScribeConnect</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            AI-powered platform connecting students with disabilities to
                            trusted volunteer scribes for inclusive education.
                        </p>

                        <div className="flex gap-4 mt-4">
                            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub].map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1b2b4d] hover:bg-[#F63049] transition text-white"
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">How It Works</a></li>
                            <li><a href="#" className="hover:text-white">Accessibility</a></li>
                            <li><a href="#" className="hover:text-white">Volunteers</a></li>
                            <li><a href="#" className="hover:text-white">Students</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Help Center</a></li>
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white">Contact</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
                        <p className="text-sm text-gray-400 mb-4">
                            Subscribe to receive updates about accessibility and new features.
                        </p>

                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full px-3 py-2 rounded-l-lg bg-[#1b2b4d] text-white outline-none text-sm"
                            />
                            <button className="bg-[#F63049] px-4 py-2 rounded-r-lg text-white hover:bg-[#e02b42] transition">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[#1b2b4d] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>© {new Date().getFullYear()} ScribeConnect. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Built with ❤️ for accessible education</p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
