import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const ChromeLayout = () => (
  <>
    <Navbar />
    <main id="main">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default ChromeLayout;
