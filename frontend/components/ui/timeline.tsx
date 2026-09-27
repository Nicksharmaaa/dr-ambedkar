"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string | number;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

export const Timeline = ({
  data,
  title = "Changelog from my journey",
  description = "I've been working on Aceternity for the past 2 years. Here's a timeline of my journey.",
  className = "",
  showHeader = true,
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref, data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={`w-full bg-transparent font-sans md:px-6 ${className}`}
      ref={containerRef}
    >
      {showHeader && (
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">
          <h2 className="text-xl md:text-4xl mb-3 text-[#0A2947] dark:text-[#F3E4C9] font-cinzel font-bold max-w-4xl">
            {title}
          </h2>
          <p className="text-[#8B5E3C] dark:text-[#D3D4C0] text-sm md:text-base max-w-xl font-montserrat">
            {description}
          </p>
        </div>
      )}

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-20 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-32 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-[#FAF7F0] dark:bg-[#0A2947] border-2 border-[#C59A45]/50 shadow-md flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-[#C59A45] shadow-[0_0_10px_rgba(197,154,69,0.6)]" />
              </div>
              <h3 className="hidden md:block text-2xl md:pl-20 md:text-4xl lg:text-5xl font-cinzel font-extrabold text-[#0A2947] dark:text-[#F3E4C9] tracking-tight">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-16 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-cinzel font-bold text-[#0A2947] dark:text-[#F3E4C9]">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-[#D3D4C0] dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[#8B5E3C] via-[#C59A45] to-transparent from-[0%] via-[10%] rounded-full shadow-[0_0_8px_rgba(197,154,69,0.8)]"
          />
        </div>
      </div>
    </div>
  );
};
