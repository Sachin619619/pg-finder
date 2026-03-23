import { NextRequest } from 'next/server';

export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin) return true; // Allow non-browser requests
  const allowedOrigins = [
    'https://castleliving.in',
    `https://${host}`,
    'http://localhost:3000',
  ];
  return allowedOrigins.some(allowed => origin === allowed);
}
