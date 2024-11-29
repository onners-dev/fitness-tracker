import Hero from '../components/Hero'
import Features from '../components/Features'
import CalorieTracker from '../components/CalorieTracker'

function Home() {
  return (
    <div className="home">
      <Hero />
      <Features />
      <CalorieTracker />
    </div>
  )
}

export default Home
