import React from "react";
import { STATS } from "./constants";

export default function Stats({ numsRef }) {
  return (
    <div className="stats grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 md:pl-6">
      {STATS.map((stat, i) => (
        <div key={stat.label} className="relative py-5 lg:py-6 mx-auto sm:mx-0 sm:max-w-[22rem]">
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start">
            <div className="whitespace-nowrap font-serif text-4xl font-extrabold leading-none text-slate-950 sm:text-6xl">
              {stat.prefix}
              <span ref={(el) => (numsRef.current[i] = el)}>0</span>
              <span className="font-light text-teal-600">{stat.suffix}</span>
            </div>
            <p className="text-lg sm:text-xl leading-tight text-slate-500">{stat.label}</p>
          </div>
          <span className="stat-line absolute bottom-0 left-0 h-px w-full bg-teal-600/20" />
        </div>
      ))}
    </div>
  );
}