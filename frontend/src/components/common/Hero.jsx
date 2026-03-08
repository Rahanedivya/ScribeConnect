import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const Hero = () => {
    return (
        <section className="relative pt-24 pb-12 lg:pt-24 lg:pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
                    >

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#faeff0] border border-[#fde2e5] mb-8">
                            <span className="text-[#F63049]">✨</span>
                            <span className="text-sm font-medium text-[#F63049]">AI-Powered Accessibility</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] font-bold text-[#1a1a2e] mb-6 tracking-tight">
                            Empowering <br className="hidden lg:block" />
                            Education Through <br className="hidden lg:block" />
                            <span className="text-[#F63049]">AI-Driven</span> Scribe <br className="hidden lg:block" />
                            Support
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-[#64748b] mb-10 max-w-2xl leading-relaxed">
                            Connect instantly with volunteer scribes or use our advanced AI
                            assistant to ensure no word is missed in your educational
                            journey.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
                            <button className="w-full sm:w-auto px-8 py-3.5 bg-[#F63049] text-white rounded-xl font-semibold hover:bg-[#d9283f] transition-all shadow-[0_4px_14px_rgba(246,48,73,0.25)] hover:shadow-[0_6px_20px_rgba(246,48,73,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                Get Started
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1a1a2e] border border-[#e2e8f0] rounded-xl font-semibold hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all flex items-center justify-center">
                                How It Works
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-[#64748b]">
                                Trusted by <span className="font-bold text-[#1a1a2e]">10,000+</span> students & volunteers
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 w-full lg:w-1/2 relative"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden bg-white ">
                            {/* This would be the actual image from the design. Using a placeholder for now that matches the style. */}
                            <img
                                src="/hero-illustration.png"
                                alt="Student with AI support"
                                className="w-full h-auto object-contain max-h-[600px] drop-shadow-2xl"
                            />
                        </div>

                        {/* Decorative blurs */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F63049] opacity-5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
