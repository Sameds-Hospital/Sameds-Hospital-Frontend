# Sameds Hospital — Frontend

This repository contains the React + TypeScript frontend for the Sameds Hospital management system. Built with Vite, it provides the user interface for staff, patients, and administrators to interact with the HMS backend and on-chain billing contract.

Key features

- Responsive dashboard for clinics, billing, and patient records
- Role-based views for staff, doctors, and patients
- PDF export and reporting utilities
- Integration with the backend API and Stellar/Soroban contract for billing

Quick start (development)

1. Install dependencies

```bash
cd "Sameds Hospital-Frontend"
npm install
```

2. Start the dev server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

Run production preview (after build)

```bash
npm run preview
```

Configuration

- Environment: the app reads runtime configuration from `vite.config.ts` and any `.env` files placed at the project root. Prefix variables with `VITE_` to expose them to the client.

Project structure (top-level)

```
src/
  ├─ assets/        # images and static assets
  ├─ components/    # reusable UI components
  ├─ modules/       # route-based pages (Appointments, Billing, EMR, etc.)
  ├─ store/         # React context and global state
  └─ utils/         # helper functions (pdfExport, auth, access control)

public/            # static files served as-is
package.json       # npm scripts and dependencies
vite.config.ts     # Vite configuration
```

Contributing

- Follow the existing TypeScript and linting rules. Run `npm run lint` and `npm run format` (if configured) before submitting PRs.
- Add tests for new components where appropriate.

Support

- For environment or runtime issues, open an issue describing the OS, Node.js version, and exact error output.

License

- See the repository root for licensing details.
