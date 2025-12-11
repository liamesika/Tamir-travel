import BookingForm from './BookingForm';

export default function BookingSection() {
  return (
    <section id="booking-form-section" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            הרשמה לטיול
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
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
