import Link from 'next/link'
import Logo from '@/components/Logo'
import { FiArrowRight, FiCheck, FiZap, FiShield, FiGlobe, FiFileText, FiSmartphone } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-surface-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-hidden sm:block">
                Dashboard
              </Link>
              <Link href="/invoice/new" className="btn-primary text-sm py-2.5 px-5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center gradient-hero noise-overlay pt-16">
        <div className="gradient-mesh absolute inset-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div className="max-w-2xl">
              <div className="animate-in">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100/80 text-primary-700 text-sm font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  Free for your first 5 invoices
                </span>
              </div>

              <h1 className="text-display-2xl text-surface-900 mb-6 animate-in delay-100">
                Create invoices
                <br />
                <span className="gradient-text">in seconds.</span>
              </h1>

              <p className="text-xl lg:text-2xl text-surface-500 font-light leading-relaxed mb-10 max-w-lg animate-in delay-200">
                Beautiful, professional invoices that get you paid faster. No accounting degree required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-in delay-300">
                <Link
                  href="/invoice/new"
                  className="btn-primary text-base py-4 px-8 inline-flex items-center justify-center gap-2 group"
                >
                  Start Creating
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-secondary text-base py-4 px-8 inline-flex items-center justify-center gap-2"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            {/* Right: Floating Invoice Preview */}
            <div className="relative animate-in delay-400 hidden lg:block">
              <div className="absolute -inset-10 bg-gradient-to-r from-primary-200/30 to-primary-300/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-3xl shadow-elevated-xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mock invoice */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-surface-200 rounded-full" />
                    <div className="h-2 w-16 bg-surface-100 rounded-full mt-2" />
                  </div>
                  <div className="ml-auto text-right">
                    <div className="h-3 w-20 bg-surface-200 rounded-full" />
                    <div className="h-2 w-14 bg-surface-100 rounded-full mt-2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-surface-50 rounded-xl" />
                    <div className="w-20 h-10 bg-surface-50 rounded-xl" />
                    <div className="w-24 h-10 bg-surface-50 rounded-xl" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-surface-50 rounded-xl" />
                    <div className="w-20 h-10 bg-surface-50 rounded-xl" />
                    <div className="w-24 h-10 bg-surface-50 rounded-xl" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-surface-50 rounded-xl" />
                    <div className="w-20 h-10 bg-surface-50 rounded-xl" />
                    <div className="w-24 h-10 bg-surface-50 rounded-xl" />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-surface-100 flex justify-end">
                  <div className="text-right">
                    <div className="text-xs text-surface-400 mb-1">Total</div>
                    <div className="text-2xl font-display font-bold gradient-text">$2,450.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-surface-300 flex justify-center pt-2">
            <div className="w-1 h-2.5 bg-surface-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-16 bg-white border-y border-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-surface-400 mb-8 tracking-wider uppercase">
            Trusted by freelancers worldwide
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap opacity-40">
            {['Vercel', 'Stripe', 'Linear', 'Notion', 'Figma'].map((brand) => (
              <span key={brand} className="text-xl font-display font-bold text-surface-400">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-display-xl text-surface-900 mb-6">
              Everything you need.
              <br />
              <span className="text-surface-400">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-xl text-surface-500 font-light">
              We stripped away the bloat. What&apos;s left is everything a freelancer actually needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              { icon: FiZap, title: '60-Second Creation', desc: 'From blank to professional invoice in under a minute. Seriously.' },
              { icon: FiFileText, title: '4 Premium Templates', desc: 'Professional, Modern, Minimal, and Creative. All stunning.' },
              { icon: FiGlobe, title: '20+ Currencies', desc: 'Invoice in any currency with automatic symbol formatting.' },
              { icon: FiShield, title: 'Secure by Default', desc: 'Your data stays in your browser. We never see your invoices.' },
              { icon: FiSmartphone, title: 'Works Everywhere', desc: 'Desktop, tablet, phone. Create invoices wherever you are.' },
              { icon: FiFileText, title: 'PDF Export', desc: 'Crystal-clear PDFs with your branding, ready to send.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-elevated hover-lift group">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-display-sm text-surface-900 mb-2">{title}</h3>
                <p className="text-surface-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-display-xl text-surface-900 mb-6">
              Three steps.
              <br />
              <span className="gradient-text">That&apos;s it.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              { step: '01', title: 'Enter details', desc: 'Add your info and the client\'s. Takes 30 seconds.' },
              { step: '02', title: 'Preview & customize', desc: 'See your invoice live. Pick a template. Add your logo.' },
              { step: '03', title: 'Download & send', desc: 'Get a perfect PDF. Send via email or share the link.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="text-center animate-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="text-6xl font-display font-bold text-surface-100 mb-4">{step}</div>
                <h3 className="text-display-md text-surface-900 mb-3">{title}</h3>
                <p className="text-surface-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <svg className="w-12 h-12 text-primary-200 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-display-lg text-surface-900 mb-8 leading-relaxed">
            &ldquo;I used to spend hours on invoices. Now it takes me 60 seconds. InvoiceCraft changed how I run my freelance business.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
            <div className="text-left">
              <div className="font-display font-semibold text-surface-900">Sarah Chen</div>
              <div className="text-sm text-surface-500">UI Designer, Freelance</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-surface-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-display-xl text-white mb-6">
            Stop wasting time.
            <br />
            Start getting paid.
          </h2>
          <p className="text-xl text-surface-400 mb-10 max-w-lg mx-auto font-light">
            Join thousands of freelancers who create invoices in seconds, not hours.
          </p>
          <Link
            href="/invoice/new"
            className="inline-flex items-center gap-2 bg-white text-surface-900 font-display font-semibold py-4 px-10 rounded-2xl text-lg hover:bg-surface-50 transition-all duration-300 hover:shadow-elevated-xl active:scale-[0.98] group"
          >
            Create Your First Invoice
            <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-surface-500 mt-6 text-sm">No signup required. Free forever for 5 invoices/month.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-surface-50 border-t border-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <Logo size="sm" className="mb-4" />
              <p className="text-sm text-surface-500 leading-relaxed">
                Simple invoicing for freelancers who&apos;d rather be creating.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-surface-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-surface-500">
                <li><Link href="/invoice/new" className="hover:text-surface-900 transition-colors">Create Invoice</Link></li>
                <li><Link href="/dashboard" className="hover:text-surface-900 transition-colors">Dashboard</Link></li>
                <li><span className="cursor-default">Templates</span></li>
                <li><span className="cursor-default">Pricing</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-surface-900 mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-surface-500">
                <li><span className="cursor-default">Invoice Guide</span></li>
                <li><span className="cursor-default">Freelancer Tips</span></li>
                <li><span className="cursor-default">Help Center</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-surface-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-surface-500">
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-100 mt-12 pt-8 text-center text-sm text-surface-400">
            &copy; 2025 InvoiceCraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
