"use client";
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import SupportNavBar from "@/components/faqsContactManagerNavBar";
import "@/app/page.module.css"; // Import custom CSS file

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WorkerScheduleComponent = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [worker, setWorker] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorker = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const workerDocRef = doc(db, "managers", user.uid, "workers", user.uid); // Assuming worker's UID is the document ID
        const workerDoc = await getDoc(workerDocRef);
        if (workerDoc.exists()) {
          setWorker({ id: workerDoc.id, ...workerDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching worker:", error);
        setError("Error fetching worker: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [auth, db]);

  const fetchSchedules = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      const q = query(collection(db, "schedules"));
      const querySnapshot = await getDocs(q);
      const scheduleData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          start: new Date(data.start),
          end: new Date(data.end),
        };
      });
      setSchedules(scheduleData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Error fetching schedules: " + error.message);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const renderSchedule = (workerId, day) => {
    const dateString = day.toISOString().split("T")[0];
    const schedule = schedules.find(
      (schedule) =>
        schedule.workerId === workerId &&
        schedule.start.toISOString().split("T")[0] === dateString
    );
    return schedule ? `${schedule.startTime} - ${schedule.endTime}` : "";
  };

  const getWeekDates = () => {
    const today = new Date();
    const firstDayOfWeek = today.getDate() - today.getDay() + 1;
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.setDate(firstDayOfWeek + i));
      return new Date(date.setHours(0, 0, 0, 0)); // Reset hours to avoid timezone issues
    });
    return days;
  };

  return (
    <>
      <SupportNavBar />
      <div className="min-h-screen flex flex-col justify-center items-center text-black relative bg-white">
        <div className="w-full max-w-7xl mt-10 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4">My Schedule</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b border-gray-300">Day</th>
                    {daysOfWeek.map((day) => (
                      <th
                        key={day}
                        className="px-4 py-2 border-b border-gray-300"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b border-gray-300">
                      {worker
                        ? `${worker.firstName} ${worker.lastName}`
                        : "Worker"}
                    </td>
                    {getWeekDates().map((day, index) => (
                      <td
                        key={index}
                        className="px-4 py-2 border-b border-gray-300"
                      >
                        {renderSchedule(worker ? worker.id : "", day)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkerScheduleComponent;
