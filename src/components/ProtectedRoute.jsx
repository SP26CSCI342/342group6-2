import { useEffect, useState } from "react";
import { Navigate, useNavigate, Outlet, Link} from "react-router-dom";
import toast from "react-hot-toast";
function ProtectedRoute() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("User");
    const [safe] = useState(token != null && user != null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!safe) {
            toast.error("please login first")
        }
    }, []);
  
    if(!safe) {
        return <Navigate to="/login" replace/>;
    } else {
        return <Outlet/>;
    }
}
export default ProtectedRoute;