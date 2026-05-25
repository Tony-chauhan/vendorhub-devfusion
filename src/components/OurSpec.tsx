'use client';

import React from 'react';
import Title from './Title';
import { ourSpecsData } from '@/assets/assets';

export default function OurSpec() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 my-16 sm:my-24 max-w-6xl mx-auto">
      <Title
        visibleButton={false}
        title="Our Specifications"
        description="We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
        {ourSpecsData.map((spec, index) => {
          const IconComponent = spec.icon;
          return (
            <div
              key={index}
              className="relative h-44 px-6 sm:px-8 flex flex-col items-center justify-center w-full text-center bg-white border border-slate-200/60 rounded-3xl group shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300"
            >
              <h3 className="text-slate-800 font-extrabold text-sm sm:text-base tracking-tight mt-4">
                {spec.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                {spec.description}
              </p>
              <div
                className="absolute -top-5 text-white w-10 h-10 flex items-center justify-center rounded-2xl shadow-md group-hover:scale-110 active:scale-95 transition-all duration-300"
                style={{ backgroundColor: spec.accent }}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
