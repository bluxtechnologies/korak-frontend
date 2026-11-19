import { BrandPageLoader } from "@/components/shared/BrandPageLoader";

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <BrandPageLoader
        size="fullscreen"
        className="bg-background"
        message="Loading Korak Digitals…"
      />
    </div>
  );
}
