import { Navigate, Outlet } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import {
  useAdminAuthStore,
  getRoleCode,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";

const AdminGuard = () => {
  const store = useAdminAuthStore();
  const roleCode = getRoleCode(store);

  // If no admin or roleCode, redirect to admin login
  if (!store.admin || !roleCode) {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.LOGIN} replace />;
  }

  // Allow access to protected routes
  return <Outlet />;
};

export default AdminGuard;
