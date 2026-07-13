"use client";
import type { Alert as AlertType } from "@/types/index";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Image } from "@heroui/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Alert } from "@heroui/alert";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import cookie from "js-cookie";

import useCaptcha from "../hooks/useCaptcha";

// 相关的验证规则
const loginSchema = z.object({
  username: z
    .string()
    .min(4, "用户名至少4个字符")
    .max(10, "用户名最多10个字符"),
  password: z
    .string()
    .min(6, "密码至少6个字符")
    .max(15, "密码最多15个字符")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/, "密码必须包含字母和数字"),
  captcha: z.string().min(4, "验证码至少4个字符").max(4, "验证码最多4个字符"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [captchaUrl, refreshCaptcha] = useCaptcha();

  // 提示框默认信息
  const [alertInfo, setAlertInfo] = useState<AlertType>({
    color: "success",
    title: "",
    isShow: false,
  });

  const {
    register, // 注册表单验证规则
    handleSubmit, // 提交表单
    formState: { errors }, // 表单是否有错误
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // 表单提交事件
  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result.data && result.code === 0) {
        // 进入此分支，说明登录成功
        const { token, data: userData } = result.data;
        // 本地存储一下，方便后面使用

        localStorage.setItem("token", token);
        localStorage.setItem("username", userData.username);
        cookie.set("token", token, { expires: 7, path: "/" }); // 设置cookie过期时间为7天

        // 设置完毕后，就可以跳转到首页了
        router.push("/");
      } else {
        // 进入此分支，说明登录失败
        setAlertInfo({
          color: "danger",
          title: result.msg || "账号或密码错误，请重试",
          isShow: true,
        });
        refreshCaptcha(); // 刷新验证码
      }
    } catch {
      setAlertInfo({
        color: "danger",
        title: "登录失败，请重试",
        isShow: true,
      });
      refreshCaptcha(); // 刷新验证码
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f7fa] via-[#f1f8e9] to-[#ffe0b2]">
      {/* 提示框 */}
      {alertInfo.isShow && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Alert hideIcon color={alertInfo.color} title={alertInfo.title} />
        </div>
      )}

      <div className="w-full max-w-5xl flex bg-white bg-opacity-80 rounded-xl shadow-xl overflow-hidden">
        {/* 左图 */}
        <div className="w-1/2 p-8 hidden md:flex items-center justify-center">
          <Image alt="logo" src="/loginIllustration.png" />
        </div>

        {/* 右表单 */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            欢迎使用渡一文档系统
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* 用户名 */}
            <div>
              <label
                className="block text-sm font-medium text-gray-600 mb-1"
                htmlFor="username"
              >
                用户名
              </label>
              <input
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                id="username"
                {...register("username")}
                placeholder="admin"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* 密码 */}
            <div>
              <label
                className="block text-sm font-medium text-gray-600 mb-1"
                htmlFor="password"
              >
                密码
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                  id="password"
                  placeholder="******"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 验证码 */}
            <div>
              <label
                className="block text-sm font-medium text-gray-600 mb-1"
                htmlFor="captcha"
              >
                验证码
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                    id="captcha"
                    {...register("captcha")}
                    placeholder="请输入验证码"
                  />
                  {errors.captcha && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.captcha.message}
                    </p>
                  )}
                </div>
                <Image
                  alt="captcha"
                  className="h-[42px] w-[100px] cursor-pointer rounded border hover:opacity-80"
                  src={captchaUrl}
                  onClick={refreshCaptcha}
                />
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              className="w-full bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 transition"
              type="submit"
            >
              登录
            </button>
          </form>

          {/* 切换注册 */}
          <div className="mt-6 text-sm text-center text-gray-600">
            还没账号？
            <Link
              className="text-blue-500 hover:underline ml-1"
              href="/register"
            >
              点我注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
