"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 判断当前路径是否为编辑器页面
  // isEditorPage是一个布尔值
  const isEditorPage = pathname.startsWith("/editor/");

  return (
    <div className="h-screen flex flex-col">
      <div className="w-full">
        <Navbar />
      </div>

      <main className="flex flex-1 overflow-hidden">
        {!isEditorPage && <Sidebar />}
        <section className="flex-1 overflow-y-auto p-6 bg-white dark:bg-black">
          {children}
        </section>
      </main>
    </div>
  );
}
