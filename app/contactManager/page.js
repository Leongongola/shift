"use client";

import React, { useState, useEffect, Suspense } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { firebaseApp } from "../../utils/firebase";
import SupportNavBar from "@/components/faqsContactManagerNavBar";

/**
 * WorkerSupport Component
 *
 * This component provides a form for workers to contact their manager for support. It handles form submission,
 * sends the support message to Firestore, and provides feedback to the user.
 *
 * @returns {JSX.Element} The WorkerSupport component
 */
const WorkerSupportComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("managerId");
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorker = async () => {
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const workersQuery = query(
          collection(db, "managers", managerId, "workers"),
          where("firstName", "==", firstName),
          where("lastName", "==", lastName)
        );
        const workersSnapshot = await getDocs(workersQuery);

        if (!workersSnapshot.empty) {
          const workerDoc = workersSnapshot.docs[0];
          const workerData = workerDoc.data();
          setWorker(workerData);
          setName(`${workerData.firstName} ${workerData.lastName}`);
        } else {
          setError("Worker not found.");
        }
        setLoading(false);
      } catch (error) {
        setError("Error fetching worker: " + error.message);
        setLoading(false);
      }
    };

    fetchWorker();
  }, [auth, db, managerId, firstName, lastName, user]);

  /**
   * Handles the form submission to send a support message
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      await addDoc(collection(db, "supportMessages"), {
        name,
        email: user.email,
        message,
        timestamp: new Date(),
        managerId,
        workerFirstName: firstName,
        workerLastName: lastName,
      });
      setStatus("Message sent successfully.");
      setName("");
      setMessage("");
    } catch (error) {
      setStatus("Error sending message: " + error.message);
    }
  };

  return (
    <>
      <SupportNavBar />
      <main className="flex min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex-col items-center justify-between pt-15">
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <h1 className="font-bold text-6xl text-white mb-8">Support</h1>
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-lg shadow-md p-8 max-w-3xl w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              Contact Your Manager
            </h2>
            <p className="text-white mb-6">
              If you have any questions or need assistance, please fill out the
              form below, and your manager will get back to you as soon as
              possible.
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-white"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3 px-6 transition-colors border-2 border-transparent hover:border-blue-300"
                >
                  Send
                </button>
              </div>
            </form>
            {status && <p className="text-white mt-4">{status}</p>}
          </div>
        </div>
      </main>
    </>
  );
};

const WorkerSupport = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <WorkerSupportComponent />
  </Suspense>
);

export default WorkerSupport;
