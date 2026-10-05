import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import ToastContainer from '@/components/Toast';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import ActiveOrdersBadge from '@/components/ActiveOrdersBadge';
import WelcomeModal from '@/components/WelcomeModal';
import Particles from '@/components/Particles';
import QuickSearch from '@/components/QuickSearch';
import PageLoader from '@/components/PageLoader';
import CustomCursor from '@/components/CustomCursor';

export const metadata = {
  title: 'IranSteam - فروشگاه بازی ایران استیم',
  description: 'خرید بازی‌های استیم با بهترین قیمت و سریع‌ترین تحویل در ایران',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1b2838'
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <PageLoader />
        <CustomCursor />
        <Particles />
        <ScrollProgress />
        <Header />
        <main className="min-h-screen relative z-10">{children}</main>
        <Footer />
        <BackToTop />
        <ActiveOrdersBadge />
        <ChatWidget />
        <QuickSearch />
        <WelcomeModal />
        <ToastContainer />
      </body>
    </html>
  );
}