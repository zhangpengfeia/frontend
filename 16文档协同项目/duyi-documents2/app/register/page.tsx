"use client";
import type { Alert as AlertType } from "@/types/index";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import useCaptcha from "../hooks/useCaptcha";

// 定义验证的规则
const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, "用户名至少4个字符")
      .max(10, "用户名最多10个字符"),
    password: z
      .string()
      .min(6, "密码至少6个字符")
      .max(15, "密码最多15个字符")
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/, "密码必须包含字母和数字"),
    confirmPassword: z.string().min(6, "密码至少6个字符"),
    captcha: z.string().min(4, "验证码至少4个字符").max(4, "验证码最多4个字符"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
// z.infer是zod提供的一个类型工具，用于根据zod schema推断出对应的TypeScript类型

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); // 是否显示密码
  const [showConfirm, setShowConfirm] = useState(false); // 是否显示确认密码

  // 验证码
  const [captchaUrl, refreshCaptcha] = useCaptcha();

  // 增加一个提示信息的状态
  const [alertInfo, setAlertInfo] = useState<AlertType>({
    color: "success",
    title: "注册成功，请登录",
    isShow: false,
  });

  const {
    register, // 注册表单验证规则
    handleSubmit, // 提交表单
    formState: { errors }, // 表单是否有错误
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // 表单验证模式，当输入框内容变化时验证
  });

  // 提交表单对应的逻辑
  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          captcha: data.captcha,
        }),
      });

      const result = await response.json();

      if (!result.code) {
        // 进入这个分支，说明注册成功
        setAlertInfo({
          color: "success",
          title: "注册成功，请登录",
          isShow: true,
        });
        // 2秒后跳转到登录页面
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // 进入这个分支，说明注册失败
        setAlertInfo({
          color: "danger",
          title: "注册失败，请重试",
          isShow: true,
        });
        refreshCaptcha(); // 刷新验证码
      }
    } catch {
      setAlertInfo({
        color: "danger",
        title: "网络异常，请稍候再试",
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
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* 确认密码 */}
            <div>
              <label
                className="block text-sm font-medium text-gray-600 mb-1"
                htmlFor="confirmPassword"
              >
                确认密码
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  placeholder="******"
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
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
            <Button
              className="w-full"
              color="primary"
              radius="lg"
              type="submit"
            >
              注册
            </Button>
          </form>

          {/* 切换注册 */}
          <div className="mt-6 text-sm text-center text-gray-600">
            已有账号？
            <Link className="text-blue-500 hover:underline ml-1" href="/login">
              点我登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
