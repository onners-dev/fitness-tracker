import Hero from '../components/Hero'
import Features from '../components/Features'


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
