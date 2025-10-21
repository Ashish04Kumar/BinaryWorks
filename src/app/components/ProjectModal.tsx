// components/ProjectModal.tsx
"use client";
import React from "react";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTheme } from "../providers/theme-provider";
import { useRouter } from "next/navigation";

type Slide = { img: string; desc: string };

type ProjectModalProps = {
  isOpen: boolean;
  title?: string;
  slides: Slide[];
};

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  title,
  slides,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  if (!isOpen) return null;

  const closeModal = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    router.replace(url.toString(), { scroll: false });
  };

  const getModalBg = () => {
    switch (theme) {
      case "retro":
        return "bg-[#fdf6e3] border-2 border-black";
      case "futuristic":
        return "bg-[#0b1220] shadow-[0_0_20px_#872DCB]";
      case "dark":
        return "bg-[rgb(30,41,59)]";
      default:
        return "bg-white";
    }
  };

  const getHeaderText = () => {
    switch (theme) {
      case "retro":
        return "text-black";
      case "futuristic":
        return "text-[#fb923c]";
      case "dark":
        return "text-gray-100";
      default:
        return "text-gray-800";
    }
  };

  const getCloseColor = () => {
    switch (theme) {
      case "retro":
        return "text-black";
      case "futuristic":
        return "text-[#fb923c]";
      case "dark":
        return "text-gray-200";
      default:
        return "text-gray-700";
    }
  };

  const getSlideBg = () => {
    switch (theme) {
      case "retro":
        return "bg-[#fff4e6] border-2 border-black";
      case "futuristic":
        return "bg-[#111827] border border-[#872DCB]";
      case "dark":
        return "bg-white/5";
      default:
        return "bg-gray-100";
    }
  };

  const getSlideText = () => {
    switch (theme) {
      case "retro":
        return "text-black";
      case "futuristic":
        return "text-[#fb923c]";
      case "dark":
        return "text-gray-200";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="cursor-pointer absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div
        className={`relative z-10 max-w-4xl w-[95%] md:w-[95%] lg:w-[95%] max-h-[95vh] overflow-hidden rounded-2xl flex flex-col ${getModalBg()}`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === "retro"
              ? "border-black"
              : theme === "futuristic"
              ? "border-[#872DCB]"
              : theme === "dark"
              ? "border-gray-700"
              : "border-gray-200"
          }`}
        >
          <h3 className={`text-xl font-semibold ${getHeaderText()}`}>
            {title ?? "Details"}
          </h3>
          <button
            onClick={closeModal}
            className={`p-2 rounded-md hover:opacity-80 transition cursor-pointer`}
          >
            <X className={`w-5 h-5 ${getCloseColor()}`} />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[85vh] flex-1">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true, el: ".custom-pagination" }}
            spaceBetween={20}
            slidesPerView={1}
            loop
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <div className="flex flex-col gap-4">
                  <div
                    className={`w-full relative rounded-md overflow-hidden ${getSlideBg()}`}
                  >
                    <img
                      src={
                        slide.img.startsWith("/")
                          ? slide.img
                          : slide.img.replace("../../public", "")
                      }
                      alt={`slide-${idx}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div
                    className={`prose max-w-none ${getSlideText()}`}
                    dangerouslySetInnerHTML={{ __html: slide.desc }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div
          className={`px-6 py-4 border-t ${
            theme === "retro"
              ? "border-black"
              : theme === "futuristic"
              ? "border-[#872DCB]"
              : theme === "dark"
              ? "border-gray-700"
              : "border-gray-200"
          }`}
        >
          <div className="custom-pagination flex justify-center" />
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
