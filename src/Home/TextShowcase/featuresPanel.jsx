import React from "react";
import FeatureCard from "./FeatureCard";

export default function FeaturesPanel({ features }) {
  return (
    <div data-panel className="flex h-full shrink-0 items-center gap-[10vw] px-[12vw]">
      {features.map((f) => (
        <div key={f.title} data-slot data-stop className="shrink-0">
          <FeatureCard feature={f} />
        </div>
      ))}
    </div>
  );
}