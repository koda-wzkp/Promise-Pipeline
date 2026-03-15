"use client";

export function CloudBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-lightest via-sky-light to-white" />
      <div className="cloud-drift absolute top-10 left-0 w-full h-24 opacity-40">
        <div className="absolute left-[10%] top-0 w-48 h-16 bg-white rounded-full blur-2xl" />
        <div className="absolute left-[30%] top-4 w-64 h-20 bg-white rounded-full blur-3xl" />
        <div className="absolute left-[60%] top-2 w-56 h-14 bg-white rounded-full blur-2xl" />
        <div className="absolute left-[80%] top-6 w-40 h-12 bg-white rounded-full blur-xl" />
      </div>
      <div className="cloud-drift-slow absolute top-32 left-0 w-full h-20 opacity-25">
        <div className="absolute left-[15%] top-0 w-56 h-16 bg-white rounded-full blur-3xl" />
        <div className="absolute left-[45%] top-4 w-72 h-18 bg-white rounded-full blur-3xl" />
        <div className="absolute left-[75%] top-2 w-48 h-14 bg-white rounded-full blur-2xl" />
      </div>
    </div>
  );
}
