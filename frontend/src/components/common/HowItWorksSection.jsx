import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    FaPenNib,
    FaRobot,
    FaCheckCircle,
    FaHeadphones,
    FaAward,
} from "react-icons/fa";

const steps = [
    {
        id: 1,
        title: "Student Requests a Scribe",
        desc: "Students create a request by selecting subject, date, time, and accessibility needs.",
        icon: <FaPenNib />,
    },
    {
        id: 2,
        title: "AI Finds Best Match",
        desc: "Our AI engine matches the student with the most suitable verified volunteer.",
        icon: <FaRobot />,
    },
    {
        id: 3,
        title: "Volunteer Accepts",
        desc: "The volunteer receives a notification and confirms availability instantly.",
        icon: <FaCheckCircle />,
    },
    {
        id: 4,
        title: "Scribe Session Happens",
        desc: "The volunteer assists the student during exams or study sessions.",
        icon: <FaHeadphones />,
    },
    {
        id: 5,
        title: "Feedback & Recognition",
        desc: "Students rate the volunteer and volunteers earn certificates & badges.",
        icon: <FaAward />,
    },
];


const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-red-50 text-[#F63049] text-sm font-medium">
                        How It Works
                    </span>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#111F35] mb-4">
                        Get Scribe Support in 5 Simple Steps
                    </h2>

                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Our AI-powered platform ensures fast, reliable, and accessible academic support
                        for students with disabilities.
                    </p>
                </motion.div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
                            <img
                                src="/how-it-works-illustration.png"
                                alt="How ScribeConnect Works"
                                className="w-full h-auto"
                            />
                        </div>
                    </motion.div>

                    {/* Steps */}
                    <div className="space-y-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#F63049] text-xl shrink-0">
                                    {step.icon}
                                </div>


                                <div>
                                    <h3 className="text-lg font-semibold text-[#111F35] mb-1">
                                        {step.id}. {step.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
