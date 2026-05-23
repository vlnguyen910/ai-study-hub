import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { resetAdminGlobalFranchiseScope } from "@/modules/admin/order-management/stores/admin-global-franchise-scope.store";
import { resetOrderListUi } from "@/modules/admin/order-management/stores/order-list-ui.store";
import { resetPosSession } from "@/modules/admin/order-management/stores/pos-session.store";
import {
  resolveAdminGlobalFranchiseScopeKey,
  type AdminGlobalFranchiseScopeKey,
} from "@/modules/admin/order-management/utils/admin-global-franchise-scope";

const clearAdminGlobalModuleState = (
  scopeKey: AdminGlobalFranchiseScopeKey | null,
) => {
  if (!scopeKey) {
    return;
  }

  resetAdminGlobalFranchiseScope(scopeKey);

  if (scopeKey === "orders") {
    resetOrderListUi();
  }

  if (scopeKey === "order-pos") {
    resetPosSession();
  }
};

/**
 * Guard bắt buộc FRANCHISE user phải chọn franchise trước khi vào dashboard.
 * - Nếu user không có active_context VÀ không phải GLOBAL → redirect select-franchise
 * - GLOBAL scope không cần chọn franchise → pass through
 */
const SelectFranchiseGuard = () => {
  const location = useLocation();
  const activeContext = useAdminAuthStore((s) => s.activeContext);
  const roles = useAdminAuthStore((s) => s.roles);
  const isAdminGlobalMode =
    activeContext?.role === "ADMIN" &&
    activeContext?.scope === "GLOBAL" &&
    !activeContext?.franchise_id;
  const currentAdminGlobalScope = resolveAdminGlobalFranchiseScopeKey(
    location.pathname,
  );
  const previousAdminGlobalScopeRef = useRef(currentAdminGlobalScope);
  const previousIsAdminGlobalModeRef = useRef(isAdminGlobalMode);
  const selfManagedFranchiseRoutes = [
    `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER}`,
    `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.PAYMENT}`,
    `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DELIVERY}`,
  ];
  const isSelfManagedFranchiseRoute = selfManagedFranchiseRoutes.some(
    (rootPath) =>
      location.pathname === rootPath ||
      location.pathname.startsWith(`${rootPath}/`),
  );

  useEffect(() => {
    const previousScope = previousAdminGlobalScopeRef.current;
    const wasAdminGlobalMode = previousIsAdminGlobalModeRef.current;

    if (previousScope && previousScope !== currentAdminGlobalScope) {
      clearAdminGlobalModuleState(previousScope);
    }

    if (
      wasAdminGlobalMode &&
      !isAdminGlobalMode &&
      previousScope === currentAdminGlobalScope
    ) {
      resetAdminGlobalFranchiseScope(previousScope);
    }

    previousAdminGlobalScopeRef.current = currentAdminGlobalScope;
    previousIsAdminGlobalModeRef.current = isAdminGlobalMode;
  }, [currentAdminGlobalScope, isAdminGlobalMode]);

  // Order, payment va delivery module tu xu ly franchise context de ho tro gate rieng trong page.
  if (isSelfManagedFranchiseRoute) {
    return <Outlet />;
  }

  // Đã chọn context rồi (GLOBAL hoặc FRANCHISE) → pass through
  if (activeContext) {
    return <Outlet />;
  }

  // Kiểm tra có franchise role không
  const hasFranchiseRole = roles.some((r) => r.scope === "FRANCHISE");

  // Nếu KHÔNG có franchise role (chỉ có GLOBAL) → pass through
  if (!hasFranchiseRole) {
    return <Outlet />;
  }

  // Có franchise role NHƯNG chưa chọn → redirect sang trang chọn
  return (
    <Navigate
      to={`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.SELECT_FRANCHISE}`}
      replace
    />
  );
};

export default SelectFranchiseGuard;
