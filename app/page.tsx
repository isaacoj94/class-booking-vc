import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-primary mb-6">
              Elevate Your Ballet Journey
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Book classes, track your progress, and achieve your goals with
              AI-powered insights
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-light transition-colors shadow-card hover:shadow-cardHover"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl font-bold text-center text-primary mb-16">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg hover:shadow-cardHover transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3">
                Easy Booking
              </h3>
              <p className="text-neutral-600">
                Book your classes in seconds. Manage your schedule and track
                your credits all in one place.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg hover:shadow-cardHover transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3">
                Track Progress
              </h3>
              <p className="text-neutral-600">
                See your improvement with detailed analytics, milestone
                checkpoints, and streak tracking.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg hover:shadow-cardHover transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3">
                AI Insights
              </h3>
              <p className="text-neutral-600">
                Get personalized class recommendations and smart reminders to
                keep you on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl font-bold mb-6">
            Ready to Begin?
          </h2>
          <p className="text-xl mb-8 text-neutral-200">
            Join our community and start your ballet journey today
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-accent-light transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </main>
  );
}
