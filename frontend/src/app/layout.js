export const metadata = {
  title: 'Katalogo | Tu marketplace espacial',
  description: 'Sistema multi-vendedor con UI 3D Espacial',
};

import './globals.css';
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
