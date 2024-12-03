import Hero from '../components/Hero'
import Features from '../components/Features'
import CalorieTracker from '../components/CalorieTracker'

function Home() {
  return (
    <div className="home">
      <Hero />
      <div id="features">
        <Features />
      </div>

    </div>
  )
}

export default Home
