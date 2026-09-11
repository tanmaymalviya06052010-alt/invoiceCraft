# InvoiceCraft - Project Brief

## Overview
A micro SaaS invoice generator for freelancers. Built with Next.js 16, TypeScript, Tailwind CSS.

## Tech Stack
- **Framework:** Next.js 16.3.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PDF:** jsPDF 4.2.1
- **Icons:** react-icons
- **Deployment:** Vercel
- **Storage:** localStorage (MVP only)

## Project Structure
```
invoicecraft/
├── src/
│   ├── app/           # Next.js pages
│   ├── components/    # React components
│   ├── lib/           # Utilities (pdf.ts, storage.ts, validation.ts)
│   └── types/         # TypeScript types
├── next.config.ts     # Security headers, CSP
└── package.json
```

## Key Features
1. Landing page (SEO optimized)
2. Invoice creator/editor with live preview
3. PDF export with professional layout
4. Dashboard with status filters
5. LocalStorage persistence
6. Input sanitization & validation
7. Error boundary component
8. 20+ currency support
9. Custom logo upload (max 2MB)
10. Brand color picker
11. 4 invoice templates (Professional, Modern, Minimal, Creative)

## Security Implemented
- Content Security Policy (CSP) headers
- Input sanitization (XSS prevention)
- Email/phone validation
- Secure ID generation (crypto.getRandomValues)
- No exposed secrets

## Known Issues (Fixed)
- Space bar input issue (sanitizeTextInput)
- Amount column overflow (flex layout)
- PDF layout overlapping (proper columns)

## Environment Variables
None required for current MVP.

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run linter

## Next Steps (Planned)
- [ ] Supabase integration (auth + database)
- [ ] Stripe payments (Pro tier)
- [ ] Custom domain
- [ ] Product Hunt launch
- [ ] Client management feature
- [ ] Recurring invoices
