import React from "react";
import { C, LINE_BASE, CLOSE_SIZE, wipeStyle } from "./constants";

export default function ClosingPanel({ closingLines }) {
  return (
    <div data-panel data-stop className="relative h-full w-screen shrink-0">
      <div
        data-closing
        className="absolute left-[6vw] top-1/2 -translate-y-1/2 md:left-[22vw]"
      >
        <h2 className="m-0 font-normal">
          {closingLines.map((line, i) => (
            <span
              key={line}
              data-line
              className={`${LINE_BASE} ${CLOSE_SIZE}`}
              style={{ ...wipeStyle, color: i === 0 ? C.cream : C.teal }}
            >
              {line}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}