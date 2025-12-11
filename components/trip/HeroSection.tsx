export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('/images/trip/hero.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          טיול חווייתי בלב הטבע הישראלי
        </h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-8 max-w-3xl mx-auto">
          חוויה בלתי נשכחת למשפחות ולחברים עם מדריך מומחה
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="#booking"
            className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
          >
            הבטחת מקום בטיול
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold text-lg px-10 py-4 rounded-2xl border-2 border-white/50 transition-all duration-300"
          >
            שיחת התאמה
          </a>
        </div>

        <div className="text-white/80 text-sm sm:text-base flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-500 rounded-full" />
            מספר המקומות מוגבל
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-500 rounded-full" />
            מקדמה של 300 ₪ לאדם לשמירת מקום
          </span>
        </div>
      </div>
    </section>
  );
}
