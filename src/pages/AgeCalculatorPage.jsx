import AdSlot from '../components/ads/AdSlot.jsx';
import AgeCalculator from '../components/calculator/AgeCalculator.jsx';
import Breadcrumb from '../components/common/Breadcrumb.jsx';
import RelatedTools from '../components/common/RelatedTools.jsx';
import InfoSection from '../components/content/InfoSection.jsx';
import Header from '../components/layout/Header.jsx';
import Logo from '../components/layout/Logo.jsx';

export default function AgeCalculatorPage() {
  return (
    <main>
      <Breadcrumb />
      <Header
        icon={<Logo className="size-11 shrink-0 min-[375px]:size-12 sm:size-16" />}
        title="Age Calculator"
        description="Calculate your exact age in years, months and days."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AdSlot placement="header" className="mb-8" />
        <AgeCalculator />
        {/* The margins keep ads clear of the calculator buttons to avoid accidental clicks. */}
        <AdSlot placement="inContent" className="mt-12" />
        <InfoSection />
        <RelatedTools toolId="age-calculator" />
        <AdSlot placement="footer" className="mt-12" />
      </div>
    </main>
  );
}
