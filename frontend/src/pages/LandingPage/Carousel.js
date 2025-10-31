import React, { useEffect, useRef } from "react";

// Import your local images from /assets
import img1 from "../../assets/AICS.jpg";
import img2 from "../../assets/IMG_0066.JPG";
import img3 from "../../assets/IMG_1540.JPG";
import img4 from "../../assets/IMG_2187.JPG";
import img5 from "../../assets/JPA09392.JPG";
import img6 from "../../assets/cis-payout.jpg";

export default function InfiniteCarousel() {
  const scrollRef = useRef(null);

  const images = [img1, img2, img3, img4, img5, img6];
  const doubledImages = [...images, ...images]; // makes it loop infinitely

  useEffect(() => {
    const container = scrollRef.current;
    let scrollAmount = 0;

    const scroll = () => {
      if (!container) return;
      scrollAmount += 1.2; // Adjust speed (higher = faster)
      if (scrollAmount >= container.scrollWidth / 2) {
        scrollAmount = 0;
      }
      container.scrollLeft = scrollAmount;
      requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(scroll);
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-hidden border border-slate-200 shadow-2xl bg-white rounded-xl">
      {/* Scrolling Track */}
      <div
        ref={scrollRef}
        className="flex overflow-x-hidden whitespace-nowrap"
        style={{ scrollBehavior: "auto" }}
      >
        {doubledImages.map((image, index) => (
          <div key={index} className="flex-none w-full relative">
            <div className="h-[350px] lg:h-[400px]">
              <img
                src={image}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Subtle thin white fades on both sides */}
      <div className="pointer-events-none absolute inset-0 flex justify-between items-center">
        <div className="w-4 h-full bg-gradient-to-r from-white via-white/40 to-transparent" />
        <div className="w-4 h-full bg-gradient-to-l from-white via-white/40 to-transparent" />
      </div>
    </div>
  );
}
