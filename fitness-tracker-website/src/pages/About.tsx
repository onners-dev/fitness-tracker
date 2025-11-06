import './About.css'
import {
  FaFire,
  FaCheckCircle,
  FaChartLine,
  FaUtensils,
  FaUserTie
} from 'react-icons/fa'
import type { ReactNode } from 'react'

interface FeatureBoxProps {
  icon: ReactNode
  headline: string
  desc: string
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ icon, headline, desc }) => (
  <div className="feature-box">
    <div className="feature-icon">{icon}</div>
    <h3>{headline}</h3>
    <p>{desc}</p>
  </div>
)

const About: React.FC = () => {
  return (
    <div className="about-page">
      <section className="section-features">
        <h2 className="section-title">Everything You Need. Nothing You Don’t.</h2>
        <div className="features-flex">
          <FeatureBox
            icon={<FaFire />}
            headline="Effortless Calorie Tracking"
            desc="Log meals in seconds, track macros, and reach your goals with science-backed precision."
          />
          <FeatureBox
            icon={<FaUtensils />}
            headline="Curated Nutrition Guidance"
            desc="Personalized meal plans and admin-reviewed food submissions—nutrition you can trust."
          />
          <FeatureBox
            icon={<FaChartLine />}
            headline="Progress Insights"
            desc="Visualize your transformation—detailed charts & trends keep motivation high."
          />
          <FeatureBox
            icon={<FaCheckCircle />}
            headline="Workout Plan Builder"
            desc="Generate, customize, and log training plans tailored to every skill level."
          />
          <FeatureBox
            icon={<FaUserTie />}
            headline="Seamless Onboarding"
            desc="Smart, guided setup ensures your experience is uniquely yours from day one."
          />
        </div>
      </section>

      <section className="section-why">
        <h2 className="section-title">Why Arcus?</h2>
        <ul className="benefits-list">
          <li>Modern, user-friendly interface—accessible on any device</li>
          <li>Data privacy at the core: your journey stays yours</li>
          <li>Regular feature upgrades—driven by our community</li>
          <li>24/7 support & a passionate fitness community</li>
          <li>Free to start—upgrade as you grow!</li>
        </ul>
      </section>

      <section className="about-footer-invite">
        <h2>Ready to Level Up?</h2>
        <p>
          Join users who trust Arcus with their progress.<br />
          Every rep, every meal, every breakthrough—tracked and celebrated.
        </p>
        <a href="/signup" className="primary-button footer-cta">
          Create My Account
        </a>
      </section>
    </div>
  )
}

export default About
