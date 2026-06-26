import React from 'react';
import { Calendar, CreditCard, Users } from 'lucide-react';

function Benefits() {
  const benefits = [
    {
      icon: Calendar,
      title: 'Exclusive Events',
      text: 'Access reunions, networking events, and social gatherings throughout the year.',
    },
    {
      icon: Users,
      title: 'Brotherhood Network',
      text: 'Connect with brothers across generations and stay close to undergraduate chapter news.',
    },
    {
      icon: CreditCard,
      title: 'Simple Dues',
      text: 'Pay membership dues and support alumni initiatives through a secure online experience.',
    },
  ];

  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="section-eyebrow">Why Join</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight">Stay connected with the chapter.</h2>
          <p className="mt-5 text-zinc-600 text-lg leading-8">
            SCSAA gives alumni a clear place to reconnect, contribute, and keep the Beta-Gamma tradition moving.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {benefits.map(({ icon, title, text }) => {
            const Icon = icon;

            return (
              <div
                key={title}
                className="rounded-3xl bg-zinc-50 p-6 transition hover:bg-zinc-100"
              >
                <div className="icon-tile mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-zinc-950 mb-3">{title}</h3>
                <p className="text-zinc-600 leading-7">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
