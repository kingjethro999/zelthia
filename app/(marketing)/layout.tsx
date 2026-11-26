import { Suspense } from "react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}
