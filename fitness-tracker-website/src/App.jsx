import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import CalorieTracker from './components/CalorieTracker';


const App = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <CalorieTracker />
      <Footer />
    </>
  );
};

export default App;
