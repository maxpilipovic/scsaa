import React from 'react';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import Gallery from '../components/Gallery';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Benefits />
      <Gallery />
      <Footer />
    </div>
  );
}

export default HomePage;