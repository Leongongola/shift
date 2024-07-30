"use client";

import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { firebaseApp } from "../../utils/firebase";

import NavBarDashboard from "@/components/navBarDashboards";

/**
 * NewDashboard Component
 *
 * This component represents the main dashboard for ShiftEaze. It includes navigation links to manage workers,
 * track work history, scheduling, and analytics. The NavBarDashboard component is used for navigation, and
 * a sign-out button is provided to log out the user.
 *
 * @returns {JSX.Element} The NewDashboard component
 */
const NewDashboard = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp); // Initialize auth with firebaseApp
  const db = getFirestore(firebaseApp);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/signin");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  useEffect(() => {
    const fetchWorkers = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const userWorkersRef = collection(db, "managers", user.uid, "workers");
        const q = query(userWorkersRef);
        const querySnapshot = await getDocs(q);

        const workersList = [];
        querySnapshot.forEach((doc) => {
          workersList.push({ id: doc.id, ...doc.data() });
        });

        setWorkers(workersList);
        setLoading(false);
      } catch (error) {
        setError("Error fetching workers: " + error.message);
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const messagesRef = collection(db, "supportMessages");
        const q = query(messagesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const messagesList = [];
        querySnapshot.forEach((doc) => {
          messagesList.push({ id: doc.id, ...doc.data() });
        });

        setMessages(messagesList);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
    };

    fetchWorkers();
    fetchMessages();
  }, [auth, db]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "supportMessages", messageId));
      setMessages(messages.filter((message) => message.id !== messageId));
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900 flex flex-col">
      <NavBarDashboard /> {/* Use the new NavBarDashboard component */}
      <header className="w-full text-white text-center py-8 ">
        <h1 className="text-5xl font-bold">Welcome to ShiftEaze</h1>
        <p className="text-lg text-gray-200 mt-2">
          Manage your workforce efficiently with ShiftEaze. Use the navigation
          bar to explore different sections of the dashboard, manage workers,
          track work history, and more.
        </p>
      </header>
      <main className="flex-1 flex flex-col md:flex-row justify-center items-start text-white py-10 w-full px-8">
        <div className="bg-black opacity-90 p-8 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3 mt-10 text-center mr-12">
          <h2 className="text-3xl font-bold text-white mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 gap-6">
            <Link
              href="/workers"
              className="bg-blue-100 p-6 rounded-lg shadow hover:bg-blue-200 transition-colors border-2 border-transparent hover:border-blue-400"
            >
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                Worker Manager
              </h2>
              <p className="text-gray-700">
                Add new workers, edit their information, and search for specific
                workers with ease.
              </p>
            </Link>
            <Link
              href="/calendar"
              className="bg-blue-100 p-6 rounded-lg shadow hover:bg-blue-200 transition-colors border-2 border-transparent hover:border-blue-400"
            >
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                Calendar Manager
              </h2>
              <p className="text-gray-700">
                Efficiently schedule shifts and ensure optimal workforce
                coverage.
              </p>
            </Link>
            <Link
              href="/workhistory"
              className="bg-blue-100 p-6 rounded-lg shadow hover:bg-blue-200 transition-colors border-2 border-transparent hover:border-blue-400"
            >
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                Worker History
              </h2>
              <p className="text-gray-700">
                View detailed work history and adjust working hours for better
                management.
              </p>
            </Link>
            <Link
              href="/analytics"
              className="bg-blue-100 p-6 rounded-lg shadow hover:bg-blue-200 transition-colors border-2 border-transparent hover:border-blue-400"
            >
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                Workforce Analytics
              </h2>
              <p className="text-gray-700">
                Get insights into workforce performance with comprehensive
                analytics.
              </p>
            </Link>
          </div>
        </div>
        <div className="bg-black opacity-90 p-8 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3 mt-10 text-center ml-12">
          <h2 className="text-3xl font-bold text-white mb-4">Messages</h2>
          <p className="text-lg text-gray-200 mb-4">
            Worker Requests and Notifications
          </p>
          {messages.length === 0 ? (
            <p>No messages.</p>
          ) : (
            <ul>
              {messages.map((message) => (
                <li key={message.id} className="py-2 text-left text-white">
                  <p>
                    <strong>Name:</strong> {message.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {message.email}
                  </p>
                  <p>
                    <strong>Message:</strong> {message.message}
                  </p>
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {message.timestamp.toDate().toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md border-2 border-transparent hover:border-red-300 mt-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <footer className="bg-black opacity-85 text-white py-1 w-full mt-auto">
        <div className="container mx-auto text-center py-8">
          <p>
            &copy; {new Date().getFullYear()} ShiftEaze. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NewDashboard;
