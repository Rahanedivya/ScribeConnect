import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { FaUniversalAccess, FaHandsHelping, FaBlind } from "react-icons/fa";

const features = [
    {
        icon: <FaUniversalAccess />,
        title: "Screen Reader Compatible",
        desc: "Optimized for major screen readers like JAWS, NVDA, and VoiceOver."
    },
    {
        icon: <FaHandsHelping />,
        title: "Keyboard Navigation",
        desc: "Full keyboard support for seamless navigation without a mouse."
    },
    {
        icon: <FaBlind />,
        title: "High Contrast Support",
        desc: "High contrast modes and scalable text for better readability."
    }
];

const AccessibilitySection = () => {
    return (
        <section id="accessibility" className="bg-[#F7F9FC] py-24">
            <div className="max-w-7xl mx-auto px-6">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-red-50 text-[#F63049] text-sm font-medium">
                        Accessibility
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#111F35] mb-4">
                        Inclusive Design for Everyone
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We are committed to making education accessible to all. Our platform is built with strict adherence to WCAG 2.1 guidelines.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 justify-center">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-50 text-[#F63049] flex items-center justify-center text-xl mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[#111F35] mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default AccessibilitySection;
