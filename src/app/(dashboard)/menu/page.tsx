import type { Metadata } from "next";
import { connection } from "next/server";
import { MenuView } from "@/features/menu/MenuView";

export const metadata: Metadata = {
  title: "Menu",
  description: "All digital services and account navigation.",
};

export default async function MenuPage() {
  await connection();
  return <MenuView />;
}
