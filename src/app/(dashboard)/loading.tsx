import { BrandPageLoader } from "@/components/shared/BrandPageLoader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BrandPageLoader size="md" message="Loading digital services…" />
    </div>
  );
}
