"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  StarIcon,
  MapIcon,
  BookOpenIcon,
  KeyIcon,
  PhoneIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
// 图标映射
const iconMap = {
  home: HomeIcon,
  users: UsersIcon,
  trash: TrashIcon,
  "archive-box": ArchiveBoxIcon,
  "document-text": DocumentTextIcon,
  eye: EyeIcon,
  star: StarIcon,
  mail: MapIcon,
  "book-open": BookOpenIcon,
  keyboard: KeyIcon,
  phone: PhoneIcon,
};

import { getSidebarItemsByPath } from "@/tools/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const sidebarItems = getSidebarItemsByPath(pathname);

  return (
    <aside className="w-64 h-full bg-gray-100 dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between flex-shrink-0">
      <ul className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] || HomeIcon; // 如果没有找到，默认给一个 HomeIcon
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <NextLink
                className={`flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary ${isActive ? "bg-gray-300 dark:bg-gray-700" : ""}`}
                href={item.href}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`text-sm font-medium ${isActive ? "text-primary" : "text-gray-700"}`}
                >
                  {item.label}
                </span>
              </NextLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
