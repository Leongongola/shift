"use client";

import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseApp } from "../utils/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/navBarLogin";
import Footer from "@/components/footer";

// Initialize Firestore
const db = getFirestore(firebaseApp);

const App = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailError, setResetEmailError] = useState("");
  const router = useRouter();

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle Email Sign-In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const auth = getAuth(firebaseApp);

    try {
      // Try to sign in as a manager first
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const managerDocRef = doc(db, "managers", user.uid);
      2;
      const managerDoc = await getDoc(managerDocRef);

      if (managerDoc.exists()) {
        // Redirect to manager dashboard
        router.push("../dashboard");
      } else {
        // Check if the user is a worker
        const managersQuery = query(collection(db, "managers"));
        const managersSnapshot = await getDocs(managersQuery);

        let foundWorker = false;
        for (const managerDoc of managersSnapshot.docs) {
          const managerId = managerDoc.id;
          const workersQuery = query(
            collection(db, "managers", managerId, "workers"),
            where("email", "==", email)
          );
          const workersSnapshot = await getDocs(workersQuery);

          if (!workersSnapshot.empty) {
            const workerDoc = workersSnapshot.docs[0];
            const workerData = workerDoc.data();

            if (workerData.passcode === password) {
              foundWorker = true;
              // Redirect to PunchInOut page
              router.push(
                `/punchInOut?managerId=${managerId}&firstName=${workerData.firstName}&lastName=${workerData.lastName}`
              );
              break;
            }
          }
        }

        if (!foundWorker) {
          setError("Invalid Email or Password, please try again.");
        }
      }
    } catch (error) {
      setError("Error signing in, please try again.");
      console.error("Error signing in: ", error);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async () => {
    const auth = getAuth(firebaseApp);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (error) {
      setResetEmailError("Error sending password reset email.");
    }
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
            Sign In Below
          </h2>
          <form
            onSubmit={handleEmailSignIn}
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
              Sign in with Email
            </button>
          </form>
          {resetEmailSent && (
            <p className="text-green-500 mb-4">
              Password reset email sent. Please check your inbox.
            </p>
          )}
          {resetEmailError && (
            <p className="text-red-500 mb-4">{resetEmailError}</p>
          )}
          <p className="mt-4 text-white text-sm text-center">
            Don't have an account?{" "}
            <Link href={`/signup`} className="text-blue-400 hover:underline">
              Sign up here!
            </Link>
          </p>
          <p className="mt-4 text-white text-sm text-center">
            Forgot password?{" "}
            <button
              onClick={handlePasswordReset}
              className="text-blue-400 hover:underline"
            >
              Reset here
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default App;
