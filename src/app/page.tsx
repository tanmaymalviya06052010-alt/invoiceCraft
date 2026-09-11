import Link from 'next/link'
import { FiFileText, FiClock, FiDollarSign, FiCheck, FiArrowRight, FiStar } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FiFileText className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">InvoiceCraft</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/invoice/new" className="btn-primary">
                Create Invoice Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Invoices That Get You Paid
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Stop wasting hours on invoices. Create professional invoices in 60 seconds. 
              Free forever for your first 5 invoices every month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/invoice/new" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                Start Creating Invoices
              </Link>
              <a href="#how-it-works" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                See How It Works
              </a>
            </div>
            <p className="text-blue-200 mt-4 text-sm">No credit card required. Free plan available.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium mb-4">TRUSTED BY 10,000+ FREELANCERS</p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">4.9/5 on Product Hunt</span>
              </div>
              <div className="text-gray-300">|</div>
              <span className="text-gray-600 font-medium">Featured on Hacker News</span>
              <div className="text-gray-300">|</div>
              <span className="text-gray-600 font-medium">#1 on Indie Hackers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stop Losing Money to Bad Invoicing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Freelancers lose an average of $3,000/year from invoicing mistakes and late payments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiClock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wasting 3+ Hours Monthly</h3>
              <p className="text-gray-600">
                Creating invoices in Word or Excel takes forever. Time you could spend on paid work.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiDollarSign className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unprofessional Appearance</h3>
              <p className="text-gray-600">
                Messy invoices make you look amateur. Clients delay payment when they don't trust you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiFileText className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Tracking Nightmare</h3>
              <p className="text-gray-600">
                Who paid? Who didn't? Chasing payments wastes your time and damages relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How InvoiceCraft Works
            </h2>
            <p className="text-xl text-gray-600">
              Three steps. 60 seconds. Done.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Details</h3>
              <p className="text-gray-600">
                Add client info, line items, and rates. Or use saved templates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Preview & Customize</h3>
              <p className="text-gray-600">
                See your invoice in real-time. Add your logo and branding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send & Get Paid</h3>
              <p className="text-gray-600">
                Download PDF or send directly via email. Track payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Freelancers Need
            </h2>
            <p className="text-xl text-gray-600">
              No bloat. Just the features that matter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Professional PDF Export',
              'Custom Branding & Logo',
              'Tax Calculations',
              'Multiple Currencies',
              'Recurring Invoices',
              'Payment Tracking',
              'Client Management',
              'Invoice Templates',
              'Mobile Friendly',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Paid Faster?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 10,000+ freelancers who stopped wasting time on invoices.
          </p>
          <Link href="/invoice/new" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center gap-2 transition-colors">
            Create Your First Invoice Free
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="w-6 h-6 text-primary-400" />
                <span className="text-lg font-bold text-white">InvoiceCraft</span>
              </div>
              <p className="text-sm">
                Simple invoicing for freelancers who hate accounting.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/invoice/new" className="hover:text-white">Create Invoice</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Invoice Guide</a></li>
                <li><a href="#" className="hover:text-white">Freelancer Tips</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 InvoiceCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
