import type { Metadata } from "next";
import { ForbiddenCard } from "@/components/shared/ForbiddenCard";

export const metadata: Metadata = {
  title: "Access Denied",
  description: "You do not have permission to view this page.",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ForbiddenCard />
    </div>
  );
}
