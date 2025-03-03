import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { toast } from "react-toastify";

const Signup = () => {
    const { register, loginWithGoogle } = useContext(AuthContext);
    const [error, setError] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleSignUp = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const userCredential = await register(email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name,
            });

            toast.success("User Registered Successfully");
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            await loginWithGoogle();
            toast.success("User Registered Successfully");
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        }
    };

    return (
        <div className="bg-white overflow-y-hidden">
            <div className="container flex flex-col mx-auto bg-white rounded-lg pt-10 lg:pt-0">
                <div className="flex justify-center w-full h-full my-auto xl:gap-14 lg:justify-normal md:gap-5">
                    <div className="flex items-center justify-center w-full lg:p-12">
                        <div className="flex items-center xl:p-10">
                            <form
                                onSubmit={handleSignUp}
                                className="flex flex-col w-full h-full pb-6 text-center bg-white rounded-3xl"
                            >
                                <h3 className="mb-3 text-4xl font-extrabold text-dark-gray-900">
                                    Sign Up
                                </h3>
                                <p className="mb-4 text-gray-700">
                                    Enter your details to create an account
                                </p>

                                <button
                                    type="button"
                                    className="flex items-center justify-center w-full py-4 mb-6 text-sm font-medium transition duration-300 rounded-2xl text-gray-900 bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300"
                                    onClick={handleGoogleRegister}
                                >
                                    <img
                                        className="h-5 mr-2"
                                        src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/logos/logo-google.png"
                                        alt="Google Logo"
                                    />
                                    Sign up with Google
                                </button>

                                <div className="flex items-center mb-3">
                                    <hr className="h-0 border-b border-solid border-gray-500 grow" />
                                    <p className="mx-4 text-gray-600">or</p>
                                    <hr className="h-0 border-b border-solid border-gray-500 grow" />
                                </div>

                                <label
                                    htmlFor="name"
                                    className="mb-2 text-sm text-start text-gray-900"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="flex items-center w-full px-5 py-4 mb-5 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-dark-gray-900 rounded-2xl"
                                    required
                                />

                                <label
                                    htmlFor="email"
                                    className="mb-2 text-sm text-start text-gray-900"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex items-center w-full px-5 py-4 mb-5 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-dark-gray-900 rounded-2xl"
                                    required
                                />

                                <label
                                    htmlFor="password"
                                    className="mb-2 text-sm text-start text-gray-900"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="flex items-center w-full px-5 py-4 mb-5 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-dark-gray-900 rounded-2xl"
                                    required
                                />

                                {error && <p className="text-red-500">{error}</p>}

                                <button
                                    type="submit"
                                    className="w-full px-6 py-5 mb-5 text-sm font-bold leading-none text-white transition duration-300 md:w-96 rounded-2xl hover:bg-purple-600 focus:ring-4 focus:ring-purple-100 bg-purple-500"
                                >
                                    Create Account
                                </button>

                                <p className="text-sm leading-relaxed text-gray-900">
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-bold text-gray-700">
                                        Log In
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
