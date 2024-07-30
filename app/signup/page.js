"use client";

import React, { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/navBarLogin";
import Footer from "@/components/footer"; // Import the Footer component

// Initialize Firestore
const db = getFirestore(firebaseApp);

const Signup = () => {
  // State variables
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const router = useRouter();

  // Handle Email Sign-Up
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const auth = getAuth(firebaseApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      setConfirmationMessage(
        "Verification email sent. Please check your inbox and verify your email before logging in."
      );

      const userDocRef = doc(db, "managers", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
      });

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error during email sign-up:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please use a different email.");
      } else {
        setError("Error signing up, please try again.");
      }
    }
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <NavBar />
      <main className="flex flex-col md:flex-row min-h-screen bg-gradient-to-r from-cyan-900 to-blue-900 items-center justify-between py-8 md:py-0">
        <div className="w-full md:w-6/12 h-full flex flex-col justify-center items-center p-4 md:p-8">
          <h1 className="font-bold text-4xl md:text-6xl text-white mb-4">
            ShiftEaze
          </h1>
          <p className="text-white text-lg mb-4 text-center">
            Streamlining Workforce Management. Efficient scheduling and
            management for better productivity.
          </p>
        </div>
        <div className="w-full md:w-6/12 h-full flex flex-col justify-center items-center p-4 md:p-8">
          <h2 className="text-white text-2xl md:text-4xl mb-6 md:mb-8">
            Manager Sign Up Below
          </h2>
          <form
            onSubmit={handleEmailSignup}
            className="flex flex-col items-center w-full max-w-xs mb-6 md:mb-8"
          >
            <div className="mb-4 w-full">
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-md text-black focus:outline-none ${
                  error
                    ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700"
                    : ""
                }`}
                placeholder="YourName@gmail.com"
                required
              />
            </div>
            <div className="mb-6 w-full">
              <label className="block text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md text-black focus:outline-none ${
                    error
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">{error}</span>
              </p>
            )}
            <button
              type="submit"
              className="bg-blue-700 text-white rounded-md py-3 px-6 w-full transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-transparent hover:border-blue-400"
            >
              Sign up with Email
            </button>
          </form>
          {confirmationMessage && (
            <p className="text-green-500 mb-4">{confirmationMessage}</p>
          )}
          <p className="mt-4 text-white text-sm text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-400 hover:underline">
              Login here!
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;
