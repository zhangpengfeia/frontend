"use client";
import type { UserInfo } from "@/types";

import { useEffect, useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { Kbd } from "@heroui/kbd";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Image } from "@heroui/image";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import cookie from "js-cookie";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, LogoutIcon } from "@/components/icons";

const iconMap = {
  home: HomeIcon,
  users: UsersIcon,
  trash: TrashIcon,
  help: QuestionMarkCircleIcon,
};

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname(); // 获取当前路径

  // 存储用户信息的状态
  const [user, setUser] = useState<UserInfo | null>(null);

  // 一开始需要获取用户的信息
  useEffect(() => {
    const fetchUser = async () => {
      const username = localStorage.getItem("username");

      if (!username) return;

      try {
        const res = await fetch(`/api/user/${username}`);
        const result = await res.json();

        if (res.ok && result.code === 0) {
          setUser(result.data);
        }
      } catch {
        alert("获取用户信息失败，请重新登录");
      }
    };

    fetchUser();
  }, []);
  // 搜索框
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="搜索文档..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  // 退出登录
  const loginOutHandler = async () => {
    // 1. 首先需要让 cookie 过期，直接调用本地服务端 api 就可以了
    await fetch("/api/logout");

    // 2. 删除本地的数据
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // 3. 删除 cookie
    cookie.remove("token", { path: "/" });

    // 4. 跳转至登录页面
    router.push("/login");
  };

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-700 px-4 sticky top-0 z-50 bg-white dark:bg-black pl-10 pr-10">
      <div className="flex items-center justify-between h-16">
        {/* navbar左边部分 */}
        <div className="flex items-center gap-4">
          {/* 网站logo和标题 */}
          <NextLink className="flex items-center gap-1" href="/">
            <Image alt="logo" src="/logo.png" width={35} />
            <p className="font-bold text-inherit">渡一文档系统</p>
          </NextLink>

          {/* 顶部菜单项 */}
          <ul className="hidden lg:flex gap-4 ml-2 relative top-0.5">
            {siteConfig.navItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "flex items-center gap-0.5",
                      isActive && "text-primary font-medium",
                      "hover:text-primary",
                    )}
                    href={item.href}
                  >
                    <Icon className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-bold text-inherit text-gray-600">
                      {item.label}
                    </p>
                  </NextLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* navbar右边部分 */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="hidden sm:flex gap-2">
            <ThemeSwitch />
          </div>
          <div className="hidden lg:block">{searchInput}</div>
          <div className="hidden md:block">
            <Dropdown>
              <DropdownTrigger>
                <Avatar src={user?.avatar || "/avatar.gif"} />
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem
                  key="logout"
                  startContent={
                    <LogoutIcon className="text-xl text-default-500 pointer-events-none flex-shrink-0" />
                  }
                  onPress={loginOutHandler}
                >
                  退出登录
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};
