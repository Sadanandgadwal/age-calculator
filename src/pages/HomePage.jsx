import AgeCalculator from '../components/calculator/AgeCalculator.jsx';
import InfoSection from '../components/content/InfoSection.jsx';
import BackgroundDecor from '../components/layout/BackgroundDecor.jsx';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen">
      <BackgroundDecor />
      <Header />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <AgeCalculator />
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}
