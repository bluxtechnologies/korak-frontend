import { redirect } from "next/navigation";
import { ROUTES } from "@/config/navigation";

export default function SocialMediaHubPage() {
  redirect(ROUTES.SOCIAL_MEDIA_BUY);
}
