import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
import { ROUTER_URL } from "../router.const";

/**
 * ClientGuard - Bảo vệ các route PRIVATE (cần đăng nhập)
 *
 * Nhiệm vụ:
 * 1. Kiểm tra user đã đăng nhập chưa (dựa vào token/state)
 * 2. Nếu CHƯA đăng nhập → redirect về /client/login và lưu route hiện tại
 * 3. Nếu ĐÃ đăng nhập → cho phép render layout + page con
 *
 * Sử dụng cho: /home, /home/cart, /home/profile, /home/change-password
 */
const ClientGuard: React.FC = () => {
  const { isLoggedIn, isInitialized } = useClientAuthStore();
  const location = useLocation();

  // Đợi khôi phục state từ localStorage
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập → redirect về login và lưu route hiện tại
  if (!isLoggedIn) {
    return (
      <Navigate
        to={ROUTER_URL.CLIENT_ROUTER.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Đã đăng nhập → cho phép truy cập
  return <Outlet />;
};

export default ClientGuard;
