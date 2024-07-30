"use client";
import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collectionGroup,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/navBarLogin";
import Footer from "@/components/footer";

const db = getFirestore(firebaseApp);

const Login = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailError, setResetEmailError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const managerDocRef = doc(db, "managers", user.uid);
        const managerDocSnap = await getDoc(managerDocRef);
        if (managerDocSnap.exists()) {
          router.push("/dashboard");
        } else {
          router.push("/workerLandingPage");
        }
      }
    });
    return unsubscribe;
  }, [router]);

  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const managerDocRef = doc(db, "managers", user.uid);
      const managerDocSnap = await getDoc(managerDocRef);
      if (managerDocSnap.exists()) {
        router.push("/dashboard");
      } else {
        const workersQuery = query(
          collectionGroup(db, "workers"),
          where("email", "==", user.email)
        );
        const workersSnapshot = await getDocs(workersQuery);
        if (!workersSnapshot.empty) {
          const managerDoc = workersSnapshot.docs[0].ref.parent.parent;
          router.push(`/workerLandingPage?managerId=${managerDoc.id}`);
        } else {
          setError("No associated manager found for this email.");
        }
      }
    } catch (error) {
      setError("Error signing in with Google: " + error.message);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const auth = getAuth(firebaseApp);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const managerDocRef = doc(db, "managers", user.uid);
      const managerDocSnap = await getDoc(managerDocRef);
      if (managerDocSnap.exists()) {
        router.push("/dashboard");
      } else {
        const workersQuery = query(
          collectionGroup(db, "workers"),
          where("email", "==", user.email)
        );
        const workersSnapshot = await getDocs(workersQuery);
        if (!workersSnapshot.empty) {
          const managerDoc = workersSnapshot.docs[0].ref.parent.parent;
          router.push(`/workerLandingPage?managerId=${managerDoc.id}`);
        } else {
          setError("No associated manager found for this email.");
        }
      }
    } catch (error) {
      setError("Invalid Email or Password, please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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
      <main className="flex min-h-screen bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500 items-center justify-between">
        <div className="w-6/12 h-screen flex flex-col justify-center items-center">
          <h1 className="text-5xl text-white mb-4">
            <span className="font-comfortaa font-bold">Welcome to,</span>{" "}
            <span className="text-6xl font-rockSalt">ShiftEaze!</span>
          </h1>
          <p className="text-white text-lg font-nixie mb-4">
            Please log in or sign up to get started!
          </p>
        </div>
        <div className="w-6/12 h-screen flex flex-col justify-center items-center bg-white bg-opacity-20 p-8 rounded-lg shadow-lg">
          <h2 className="text-white text-4xl font-comfortaa font-bold mb-8">
            Login Below
          </h2>
          <form
            onSubmit={handleEmailSignIn}
            className="flex flex-col items-center w-full max-w-xs"
          >
            <div className="mb-4 w-full">
              <label className="block text-white font-comfortaa font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-md text-black focus:outline-none font-nixie ${
                  error
                    ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700"
                    : ""
                }`}
                placeholder="YourName@gmail.com"
                required
              />
            </div>
            <div className="mb-6 w-full">
              <label className="block text-white font-comfortaa font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md text-black focus:outline-none font-nixie ${
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
              className="bg-blue-700 text-white rounded-md py-3 px-6 mb-4 w-full transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 animate-pulse border-2 border-transparent hover:border-blue-400 font-comfortaa font-semibold"
            >
              Sign in with Email
            </button>
          </form>
          <button
            onClick={handleGoogleSignIn}
            className="bg-blue-700 text-white rounded-md py-3 px-6 mb-4 w-full max-w-xs transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-transparent hover:border-blue-400 font-comfortaa font-semibold"
          >
            Sign in with Google
          </button>
          {resetEmailSent && (
            <p className="text-green-500 mb-4">
              Password reset email sent. Please check your inbox.
            </p>
          )}
          {resetEmailError && (
            <p className="text-red-500 mb-4">{resetEmailError}</p>
          )}
          <p className="mt-4 text-white text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-700 hover:underline">
              Sign up here!
            </Link>
          </p>
          <p className="mt-4 text-white text-sm text-center">
            Forgot password?{" "}
            <button
              onClick={handlePasswordReset}
              className="text-blue-700 hover:underline"
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

export default Login;
