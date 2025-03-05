import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X } from "lucide-react";
import github from "../assets/svg/github.svg";

const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully!");
        navigate("/");
    };

    return (
        <header className="w-full bg-gradient-to-r from-sky-50 to-emerald-50 shadow-sm px-4 sm:px-8 lg:px-12 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="text-2xl md:text-3xl font-bold text-gray-900 hover:text-blue-600 transition duration-300"
                >
                    MediAlert
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="sm:hidden text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition duration-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Desktop Menu */}
                <nav className="hidden sm:flex items-center gap-x-4 md:gap-x-6">
                    {/* Figma UI Button */}
                    <a
                        href="https://www.figma.com/proto/kpXSdtDpFnmOgisz1wZI77/WebDesign2?node-id=24-2&p=f&t=GKRhTQOqvLttVjwr-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=24%3A2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition duration-300 shadow-sm hover:shadow-md"
                    >
                        Figma UI
                    </a>

                    {/* GitHub Link */}
                    <a
                        href="https://github.com/rishii100/Code-Wizards"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center border border-gray-300 bg-white hover:bg-gray-100 text-gray-900 px-3 py-2 rounded-md transition duration-300 shadow-sm hover:shadow-md"
                    >
                        <img src={github} alt="GitHub" className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="hidden sm:inline-block ml-2 text-sm font-medium">GitHub</span>
                    </a>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 shadow-sm hover:shadow-md focus:outline-none"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <nav className="flex flex-col items-start mt-3 gap-y-2 border-t pt-3">
                    <a
                        href="https://www.figma.com/proto/kpXSdtDpFnmOgisz1wZI77/WebDesign2?node-id=24-2&p=f&t=GKRhTQOqvLttVjwr-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=24%3A2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md transition duration-300"
                    >
                        View Figma UI
                    </a>
                    <a
                        href="https://github.com/rishii100/Code-Wizards"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-md transition duration-300"
                    >
                        GitHub
                    </a>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-300"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;