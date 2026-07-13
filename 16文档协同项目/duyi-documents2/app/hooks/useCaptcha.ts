// 封装验证相关逻辑
import { useEffect, useState } from "react";

export default function useCaptcha(): [string, () => void] {
  const [captchaUrl, setCaptchaUrl] = useState("/res/captcha");

  const refreshCaptcha = () => {
    setCaptchaUrl("/res/captcha?" + Date.now());
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  return [captchaUrl, refreshCaptcha];
}
