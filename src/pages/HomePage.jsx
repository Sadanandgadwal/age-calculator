import AdSlot from '../components/ads/AdSlot.jsx';
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
        <AdSlot placement="header" className="mb-8" />
        <AgeCalculator />
        {/* The margins keep ads clear of the calculator buttons to avoid accidental clicks. */}
        <AdSlot placement="inContent" className="mt-12" />
        <InfoSection />
        <AdSlot placement="footer" className="mt-12" />
      </main>
      <Footer />
    </div>
  );
}
