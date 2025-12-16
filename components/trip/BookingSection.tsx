import BookingForm from './BookingForm';

export default function BookingSection() {
  return (
    <section id="booking-form-section" className="py-8 sm:py-10 bg-sage-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-5">
          <span className="inline-block text-nature-600 font-medium mb-1.5 text-xs">
            הרשמה
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-1.5">
            הרשמה לטיול
          </h2>
          <p className="text-sm sm:text-base text-sage-600 max-w-2xl mx-auto">
            מלאו את הפרטים ועברו לתשלום מאובטח
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
