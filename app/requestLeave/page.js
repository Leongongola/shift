"use client";

import React, { useState, useEffect, Suspense } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TextField, Button, Box, Typography } from "@mui/material";
import SupportNavBar from "@/components/faqsContactManagerNavBar";

/**
 * RequestLeave Component
 *
 * This component provides a form for workers to request leave. It includes a calendar to select dates,
 * input fields for specifying additional notes, and handles form submission to send the leave request
 * to Firestore.
 *
 * @returns {JSX.Element} The RequestLeave component
 */
const RequestLeaveComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("managerId");
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const user = auth.currentUser;

  const [selectedDates, setSelectedDates] = useState([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending request...");
    try {
      await addDoc(collection(db, "leaveRequests"), {
        workerName: `${firstName} ${lastName}`,
        managerId,
        email: user.email,
        selectedDates,
        notes,
        timestamp: new Date(),
      });
      setStatus("Leave request sent successfully.");
      setSelectedDates([]);
      setNotes("");
    } catch (error) {
      setStatus("Error sending leave request: " + error.message);
    }
  };

  return (
    <>
      <SupportNavBar />
      <Box className="flex min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex-col items-center justify-between pt-15">
        <Box className="w-full h-screen flex flex-col justify-center items-center">
          <Typography variant="h1" className="font-bold text-white mb-8">
            Request Leave
          </Typography>
          <Box className="bg-black opacity-85 rounded-lg shadow-md p-8 max-w-4xl w-full">
            <Typography variant="h2" className=" font-bold text-white mb-4">
              Select Dates for Leave
            </Typography>
            <Calendar
              onChange={handleDateChange}
              selectRange
              value={selectedDates}
              className="mb-6 react-calendar--large"
            />
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Box>
                <TextField
                  label="Reason for Leave Request"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  InputProps={{
                    style: { color: "white" },
                  }}
                  InputLabelProps={{
                    style: { color: "white" },
                  }}
                />
              </Box>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3 px-6 transition-colors border-2 border-transparent hover:border-blue-300"
                >
                  Send Leave Request
                </Button>
              </Box>
            </form>
            {status && (
              <Typography className="text-white mt-4">{status}</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};
const RequestLeave = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RequestLeaveComponent />
  </Suspense>
);

export default RequestLeave;
