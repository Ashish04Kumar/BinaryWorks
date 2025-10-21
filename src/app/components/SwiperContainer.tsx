"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

type Slide = {
  image: string;
  description?: string;
};

interface SwiperContainerProps {
  slides: Slide[];
}

const SwiperContainer: React.FC<SwiperContainerProps> = ({ slides }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      // navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}
      slidesPerView={1}
      className="rounded-xl"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="flex flex-col items-center justify-center">
            <Image
              src={slide.image} // slide.image is the imported image module
              alt={`slide-${index}`}
              className="max-h-96"
              style={{ objectFit: "cover", width: "100%" }}
            />
            {slide.description && (
              <p className="mt-2 text-center">{slide.description}</p>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SwiperContainer;
