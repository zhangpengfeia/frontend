import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "退出登录",
    },
    {
      status: 200,
      headers: {
        "Set-Cookie": "token=; Path=/; Max-Age=0; SameSite=Lax; Secure",
      },
    },
  );
}
