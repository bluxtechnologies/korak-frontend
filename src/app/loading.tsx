import { BrandPageLoader } from "@/components/shared/BrandPageLoader";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <BrandPageLoader size="fullscreen" message="Loading Korak Digitals…" />
    </div>
  );
}
