// 该中间件主要用于做路由的验证，类似于导航守卫
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; // 获取当前路径

  // 有一些路径不需要做验证
  const publicPaths = ["/login", "/_next", "/api", "/register", "/res"];

  // 静态资源或者公开路径不做拦截
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next(); // 直接放行
  }

  // 代码来到这里，说明是需要验证的路径
  const token = request.cookies.get("token")?.value; // 获取 cookie 中的 token

  if (!token) {
    // 直接跳转到登录页面
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl); // 重定向到登录页面
  }

  // 代码来到这里，说明 token 存在，还需要验证 token 是否过期
  // 后端的 api 为 /api/user/whoami
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/user/whoami`,
    {
      headers: {
        Authorization: token, // 设置请求头
      },
    },
  );

  if (!res.ok) {
    // 说明 token 已经过期了，重新跳转到登录页面
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl); // 重定向到登录页面
  }

  // 代码来到这里，说明 token 没有过期，直接放行
  return NextResponse.next(); // 直接放行
}
