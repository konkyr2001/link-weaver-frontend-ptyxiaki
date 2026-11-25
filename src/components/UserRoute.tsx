import { Navigate } from "react-router-dom";

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!user && !token) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>;
};

export default UserRoute
