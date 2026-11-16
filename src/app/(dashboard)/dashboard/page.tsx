import { redirect } from "next/navigation";
import { ROUTES } from "@/config/navigation";

export default function DashboardRedirectPage() {
  redirect(ROUTES.OVERVIEW);
}
