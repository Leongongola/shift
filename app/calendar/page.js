"use client";
import React, { useState, useEffect, Suspense } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  getDoc,
} from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "react-modal";
import { TextField, Button, Box, Typography } from "@mui/material";
import SupportNavBar from "@/components/faqsContactManagerNavBar";
import "@/app/page.module.css"; // Import custom CSS file

// Configure moment and localizer for the calendar
const localizer = momentLocalizer(moment);

const ScheduleManagerComponent = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("");
  const [workers, setWorkers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchWorkers = async () => {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      try {
        const q = query(collection(db, "managers", user.uid, "workers"));
        const querySnapshot = await getDocs(q);
        const workerData = [];
        querySnapshot.forEach((doc) => {
          workerData.push({ id: doc.id, ...doc.data() });
        });
        setWorkers(workerData);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };

    fetchWorkers();
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
      setEvents(scheduleData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedDate({ start, end });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDate(null);
    setWorkerId("");
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Creating schedule...");
    try {
      const scheduleRef = collection(db, "schedules");
      const newEvent = {
        start: selectedDate.start,
        end: selectedDate.end,
        workerId,
        title: `${getWorkerName(workerId)}: ${startTime} - ${endTime}`,
        startTime,
        endTime,
      };
      await addDoc(scheduleRef, newEvent);

      const workerDocRef = doc(
        db,
        "managers",
        auth.currentUser.uid,
        "workers",
        workerId
      );
      const workerDoc = await getDoc(workerDocRef);
      let workerSchedule = {};
      if (workerDoc.exists()) {
        workerSchedule = workerDoc.data().schedule || {};
      }
      const dateString = selectedDate.start.toISOString().split("T")[0];
      workerSchedule[dateString] = { startTime, endTime };

      await updateDoc(workerDocRef, { schedule: workerSchedule });

      setEvents([...events, newEvent]);
      setStatus("Schedule created successfully.");
      closeModal();
    } catch (error) {
      setStatus("Error creating schedule: " + error.message);
    }
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find((worker) => worker.id === workerId);
    return worker ? `${worker.firstName} ${worker.lastName}` : "";
  };

  const customTimeGutterHeader = () => {
    return (
      <div>
        {workers.map((worker, index) => (
          <div
            key={index}
            className="h-16 flex items-center justify-center border-b border-gray-200"
          >
            {worker.firstName} {worker.lastName}
          </div>
        ))}
      </div>
    );
  };

  const customEventWrapper = ({ event }) => {
    const worker = workers.find((w) => w.id === event.workerId);
    return (
      <div className="bg-blue-500 text-white rounded p-1">
        {worker ? worker.firstName : ""} {worker ? worker.lastName : ""}
        <br />
        {event.title}
      </div>
    );
  };

  return (
    <>
      <SupportNavBar />
      <div className="min-h-screen flex flex-col justify-center items-center text-black relative bg-white">
        <div className="w-full max-w-7xl mt-10 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4">
            Schedule Manager
          </h1>
          <div className="flex border border-black rounded-lg">
            <div className="flex-shrink-0 border-r border-black">
              {workers.map((worker) => (
                <div key={worker.id} className="p-4 border-b border-black">
                  {worker.firstName} {worker.lastName}
                </div>
              ))}
            </div>
            <div className="flex-grow bg-white">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                views={["work_week"]}
                defaultView="work_week"
                style={{ height: 1000, width: "100%" }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event) => alert(event.title)}
                components={{
                  timeGutterHeader: customTimeGutterHeader,
                  eventWrapper: customEventWrapper,
                  timeGutter: () => null, // Remove time slots
                }}
              />
            </div>
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Create Schedule"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography variant="h4" className="font-bold mb-4">
            Create Schedule
          </Typography>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Box>
              <TextField
                select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                fullWidth
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select a worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.firstName} {worker.lastName}
                  </option>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                placeholder="HH:MM"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </Box>
            <Box>
              <TextField
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                placeholder="HH:MM"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </Box>
            <Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3 px-6 transition-colors border-2 border-transparent hover:border-blue-300"
              >
                Create Schedule
              </Button>
            </Box>
          </form>
          {status && (
            <Typography className="text-black mt-4">{status}</Typography>
          )}
        </Modal>
      </div>
    </>
  );
};

const ScheduleManager = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ScheduleManagerComponent />
  </Suspense>
);

export default ScheduleManager;
