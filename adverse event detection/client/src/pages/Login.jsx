import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
    const { login, loginWithGoogle } = useContext(AuthContext);
    const [error, setError] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleSignIn = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            await login(email, password);
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'You have been logged in successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            navigate(from, { replace: true });
        } catch (error) {
            const errorMessage = error.message;
            setError(errorMessage);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
                confirmButtonText: 'Try Again'
            });
        }
    };

    const handleGoogleRegister = () => {
        loginWithGoogle()
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: 'You have been logged in successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate(from, { replace: true });
            })
            .catch((error) => {
                const errorMessage = error.message;
                setError(errorMessage);
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: errorMessage,
                    confirmButtonText: 'Try Again'
                });
            });
    };

    return (
        <div className="bg-white overflow-y-hidden">
            <div className="container flex flex-col mx-auto bg-white rounded-lg pt-10 lg:pt-0">
                <div className="flex justify-center w-full h-full my-auto xl:gap-14 lg:justify-normal md:gap-5 draggable">
                    <div className="flex items-center justify-center w-full lg:p-12">
                        <div className="flex items-center xl:p-10">
                            <form onSubmit={handleSignIn} className="flex flex-col w-full h-full pb-6 text-center bg-white rounded-3xl">
                                <h3 className="mb-3 text-4xl font-extrabold text-dark-gray-900">Log In</h3>
                                <p className="mb-4 text-gray-700">Enter your email and password</p>
                                <button type="button" className="flex items-center justify-center w-full py-4 mb-6 text-sm font-medium transition duration-300 rounded-2xl text-gray-900 bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300" onClick={handleGoogleRegister}>
                                    <img className="h-5 mr-2" src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/logos/logo-google.png" alt="Google Logo" />
                                    Sign in with Google
                                </button>
                                <div className="flex items-center mb-3">
                                    <hr className="h-0 border-b border-solid border-gray-500 grow" />
                                    <p className="mx-4 text-gray-600">or</p>
                                    <hr className="h-0 border-b border-solid border-gray-500 grow" />
                                </div>
                                <label htmlFor="email" className="mb-2 text-sm text-start text-gray-900">Email</label>
                                <input id="email" type="email" placeholder="Enter your email" className="flex items-center w-full px-5 py-4 mr-2 text-sm font-medium outline-none focus:bg-gray-400 mb-7 placeholder:text-gray-700 bg-gray-200 text-dark-gray-900 rounded-2xl" />
                                <label htmlFor="password" className="mb-2 text-sm text-start text-gray-900">Password</label>
                                <input id="password" type="password" placeholder="Enter your password" className="flex items-center w-full px-5 py-4 mb-5 mr-2 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-dark-gray-900 rounded-2xl" />

                                {error && <p className="text-red-500">{error}</p>}

                                <button type="submit" className="w-full px-6 py-5 mb-5 text-sm font-bold leading-none text-white transition duration-300 md:w-96 rounded-2xl hover:bg-purple-600 focus:ring-4 focus:ring-purple-100 bg-purple-500">Sign In</button>
                                <p className="text-sm leading-relaxed text-gray-900">Not registered yet? <Link to="/signup" className="font-bold text-gray-700">Create an Account</Link></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;