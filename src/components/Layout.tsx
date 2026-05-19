import type { ReactNode } from 'react';
import Nav from './Nav';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" className="site-main">{children}</main>
      <Footer />
    </>
  );
}
