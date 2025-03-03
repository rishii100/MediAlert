import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <h2 className="text-center mt-10">Loading...</h2>;

    return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
