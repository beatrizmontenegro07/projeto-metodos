import { HouseIcon, ShieldUserIcon, UsersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/infra/auth/session";
import { hasPermission, type Permission } from "@/modules/auth/permissions";

import { AppSidebar } from "./app-sidebar";

type NavigationEntry = {
  href: string;
  titleKey: "home" | "patients" | "users";
  icon: React.ReactNode;
  permission?: Permission;
};

const NAVIGATION: NavigationEntry[] = [
  { href: "/", titleKey: "home", icon: <HouseIcon /> },
  { href: "/patients", titleKey: "patients", icon: <UsersIcon />, permission: "MANAGE_PATIENTS" },
  { href: "/users", titleKey: "users", icon: <ShieldUserIcon />, permission: "MANAGE_USERS" },
];

/** NF-SEG-02: the menu shows only the areas the signed-in user's role can open. */
export async function CurrentUserSidebar() {
  const user = await requireUser();
  const t = await getTranslations();

  const items = NAVIGATION.filter(({ permission }) => !permission || hasPermission(user.role, permission)).map(
    ({ href, titleKey, icon }) => ({ href, icon, title: t(`navigation.${titleKey}`) }),
  );

  return (
    <AppSidebar
      items={items}
      user={{ name: user.name, email: user.email, roleLabel: t(`users.roles.${user.role}`) }}
      labels={{ menu: t("navigation.menu"), signOut: t("navigation.signOut"), tagline: t("authPanel.tagline") }}
    />
  );
}
