import { BrandPageLoader } from "@/components/shared/BrandPageLoader";

export default function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <BrandPageLoader size="md" message="Loading…" />
    </div>
  );
}
