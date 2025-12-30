import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition text-sm"
            >
              מדיניות פרטיות
            </Link>
            <Link
              href="/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition text-sm"
            >
              תנאי שימוש
            </Link>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Tamir Tours. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  )
}
