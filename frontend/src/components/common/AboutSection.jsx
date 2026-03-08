import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const AboutSection = () => {
    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left – Image / Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex justify-center"
                >
                    <div className="bg-[#F7F9FC] rounded-2xl shadow-lg p-6 max-w-md w-full">
                        <img
                            src="/about-illustration.png"
                            alt="About ScribeConnect"
                            className="w-full h-auto"
                        />
                    </div>
                </motion.div>

                {/* Right – Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Badge */}
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-red-50 text-[#F63049] text-sm font-medium">
                        About ScribeConnect
                    </span>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold text-[#111F35] mb-6 leading-tight">
                        Making Education Accessible, <br />
                        Reliable & Inclusive for Everyone
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-lg mb-6 max-w-xl">
                        ScribeConnect is an AI-powered platform designed to connect students with disabilities
                        to verified volunteer scribes quickly and safely. Our mission is to ensure that
                        no student is limited by accessibility barriers in their academic journey.
                    </p>

                    <p className="text-gray-600 text-lg mb-8 max-w-xl">
                        With intelligent matching, urgent request handling, and trust-based verification,
                        ScribeConnect creates a reliable ecosystem where students receive timely support and
                        volunteers are recognized for their contributions.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#F7F9FC] p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-[#F63049]">10k+</h3>
                            <p className="text-sm text-gray-600">Students Helped</p>
                        </div>

                        <div className="bg-[#F7F9FC] p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-[#F63049]">4k+</h3>
                            <p className="text-sm text-gray-600">Volunteers</p>
                        </div>

                        <div className="bg-[#F7F9FC] p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-[#F63049]">98%</h3>
                            <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                    </div>

                    {/* Button */}
                    <button className="bg-[#F63049] hover:bg-[#e02b42] transition text-white px-6 py-3 rounded-lg font-medium">
                        Learn More
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;
