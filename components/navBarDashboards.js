"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseApp } from "@/utils/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/**
 * NavBarDashboard Component
 *
 * This component renders a navigation bar for the dashboard, including links to various pages, a user profile picture,
 * and a logout button. It fetches the user's profile picture from Firebase Firestore and displays it in the navbar.
 *
 * @returns {JSX.Element} The NavBarDashboard component
 */
const NavBarDashboard = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [profilePic, setProfilePic] = useState("");

  // Fetch the user's profile picture from Firestore
  useEffect(() => {
    const fetchUserProfilePic = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfilePic(userData.photoURL);
        }
      }
    };

    fetchUserProfilePic();
  }, [auth, db]); // Added `db` to the dependency array

  // Handle user logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/signin");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <nav className="bg-black opacity-85 text-white py-4 relative z-10">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-xl font-bold">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link href="/dashboard" className="hover:text-blue-400">
            Home
          </Link>
          <Link href="/workers" className="hover:text-blue-400">
            Workers
          </Link>
          <Link href="/calendar?view=admin" className="hover:text-blue-400">
            Calendar
          </Link>
          <Link href="/workersDashboard" className="hover:text-blue-400">
            Workers Dashboard
          </Link>
          <Link
            href="/profile"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-gray-400"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-red-400"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBarDashboard;
