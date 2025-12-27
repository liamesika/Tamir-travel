import BookingForm from './BookingForm';
import SeasonalBanner from './SeasonalBanner';

export default function BookingSection() {
  return (
    <section id="booking-form-section" className="py-10 sm:py-14 bg-sage-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-block text-nature-600 font-semibold mb-2 text-base">
            הרשמה
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
            הרשמה לטיול
          </h2>
          <p className="text-lg sm:text-xl text-sage-600 max-w-2xl mx-auto">
            מלאו את הפרטים ועברו לתשלום מאובטח
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SeasonalBanner />
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
