import { CouponCalculator } from "@/components/coupon-calculator";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <CouponCalculator />
        </div>
      </div>
    </main>
  );
}
