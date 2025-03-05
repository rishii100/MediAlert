import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';

const UserSelection = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleDoctorClick = () => {
        navigate("/login"); // Redirect to login page
    };

    const handlePatientClick = () => {
        setIsLoading(true);

        Swal.fire({
            title: 'Redirecting...',
            text: 'Redirecting to the live demo.',
            icon: 'info',
            timer: 3000,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                window.location.href = "https://www.figma.com/proto/TdOuVyQ9TKeTL9KBBCp7wb/WebDesign?node-id=11-343&t=1t2yUjlGP499ruZ8-1&starting-point-node-id=11%3A343";
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <motion.div
                className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full mx-4 relative overflow-hidden"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.div
                    className="absolute -top-20 -left-20 w-40 h-40 bg-blue-200 rounded-full blur-2xl opacity-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-200 rounded-full blur-2xl opacity-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                />

                {/* Content */}
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome!</h1>
                <p className="text-gray-600 mb-8">Please select your role to continue.</p>

                <div className="space-y-6">
                    <motion.button
                        onClick={handleDoctorClick}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:scale-105 active:scale-95"
                        whileTap={{ scale: 0.95 }}
                    >
                        👨‍⚕️ Doctor
                    </motion.button>

                    <motion.button
                        onClick={handlePatientClick}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-600 hover:shadow-lg hover:scale-105 active:scale-95"
                        whileTap={{ scale: 0.95 }}
                    >
                        🏥 Patient
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default UserSelection;