import React from 'react';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import LandingGallery from '../components/LandingGallery';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Benefits />
      <LandingGallery />
      <Footer />
    </div>
  );
}

export default HomePage;