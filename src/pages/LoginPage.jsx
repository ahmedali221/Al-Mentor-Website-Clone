import React from 'react'
import Custom_Input_Field from '../components/custom_Input_Field'
import { useState } from 'react'
import SocialLoginButton from '../components/SocialLoginButton'
import { FaFacebook, FaGoogle } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function LoginPage() {
    const [email, setEmail] = useState("")

    const handleChange = (e) => {
        if (e.target.id == "email") {
            setEmail(e.target.value)
        }

    }
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Submitted")
    }
    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center min-h-screen pt-16">
                <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-100'>
                    <h1 className='text-3xl font-semibold mb-4 text-center w-96 mx-auto'>Welcome to almentor!</h1>
                    
                    <SocialLoginButton 
                        provider="Facebook" 
                        icon={<FaFacebook className="text-xl" />} 
                    />
                    <SocialLoginButton 
                        provider="Google" 
                        icon={<FaGoogle className="text-xl" />} 
                    />

                    <div className="relative flex py-5 items-center w-96 mx-auto">
                        <div className="flex-grow border-t border-gray-800"></div>
                        {/* <span className="flex-shrink mx-4 text-gray-800">OR</span>
                        <div className="flex-grow border-t border-gray-800"></div> */}
                    </div>

                    <div className="w-96 mx-auto">
                        <Custom_Input_Field
                            Label="Enter Your Email"
                            id="email"
                            type="email"
                            onChange={handleChange}
                            value={email}
                            placeholder = "Type Your Email..."
                        ></Custom_Input_Field>
                    </div>

                    <button
                        type="submit"
                        className='bg-red-600 px-4 mt-1 py-2 text-white hover:bg-red-700 sm:px-8 sm:py-3 rounded-md w-100 sm:w-96 mx-auto'
                    >
                        Login
                    </button>
                </form>
            </div>
            <Footer />
        </>
    )
}

export default LoginPage