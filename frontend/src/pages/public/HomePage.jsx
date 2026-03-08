import Navbar from '../../components/common/Navbar'
import Hero from '../../components/common/Hero'
import AboutSection from '../../components/common/AboutSection'
import HowItWorksSection from '../../components/common/HowItWorksSection'
import AccessibilitySection from '../../components/common/AccessibilitySection'
import Footer from '../../components/common/footer'

const HomePage = () => {
    return (
        <>
            <Navbar />
            <main className="main-content">
                <div id="home">
                    <Hero />
                </div>

                <div id="about">
                    <AboutSection />
                </div>

                <HowItWorksSection />
                <AccessibilitySection />
                <Footer />
            </main>
        </>
    )
}

export default HomePage
