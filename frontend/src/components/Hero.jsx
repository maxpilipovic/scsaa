import React from 'react';
import { useNavigate } from 'react-router-dom';
import image2 from '../assets/image2.JPG';

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-end min-h-[560px]">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
              <span className="h-2 w-2 rounded-full bg-zinc-950" />
              Alumni Association for Sigma Pi Beta-Gamma
            </div>
            <h1 className="mt-8 max-w-4xl text-6xl sm:text-7xl lg:text-8xl font-black text-zinc-950 tracking-tight leading-[0.88]">
              Sidwell Crook Stewart Alumni
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-zinc-700 max-w-2xl leading-8">
              A direct, simple home for Beta-Gamma alumni to stay connected, support the chapter, and keep the brotherhood active.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary px-7 py-4 text-base"
              >
                Join the Association
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary px-7 py-4 text-base"
              >
                Member Login
              </button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-3 max-w-xl">
              {['Events', 'Dues', 'Network'].map((item) => (
                <div key={item} className="rounded-2xl bg-zinc-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">Member</p>
                  <p className="mt-2 font-bold text-zinc-950">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] bg-zinc-50 p-3">
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-zinc-50">
                <img
                  src={image2}
                  alt="Sigma Pi alumni gathering"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-zinc-500">Association</p>
                  <p className="font-bold text-zinc-950">Beta-Gamma</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-zinc-500">Focus</p>
                  <p className="font-bold text-zinc-950">Alumni connection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
