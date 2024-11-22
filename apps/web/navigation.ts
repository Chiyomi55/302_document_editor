import { locales } from "./lib/utils";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const { redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });
