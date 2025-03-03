import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import github from "../assets/svg/github.svg";

const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="w-full flex justify-between items-center bg-white shadow-md px-6 sm:px-12 py-4 border-b border-gray-200">
            <div className="flex items-center">
                <Link 
                    to="/dashboard" 
                    className="text-xl sm:text-2xl font-bold text-black hover:text-blue-800 transition duration-300"
                >
                    Project Name
                </Link>
            </div>

            <div className="flex items-center gap-x-4 sm:gap-x-6">
                <a 
                    href="https://github.com/rishii100/Code-Wizards" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-900 px-3 py-2 rounded-md transition duration-300"
                >
                    <img src={github} alt="GitHub" className="w-6 h-6 mx-1" />
                    {/* <span className="hidden sm:inline font-medium">GitHub</span> */}
                </a>

                <button 
                    onClick={handleLogout}
                    className="font-inter font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
