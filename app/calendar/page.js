"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { firebaseApp } from "../../utils/firebase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import Modal from "react-modal";
import { TextField, Button, Box, Typography } from "@mui/material";
import SupportNavBar from "@/components/faqsContactManagerNavBar";
import "@/app/page.module.css"; // Import custom CSS file

// Custom styled-components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #022c43, #1b3b6f);
  color: white;
`;

const Content = styled.div`
  background: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  margin: 20px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
`;

const CustomCalendar = styled(Calendar)`
  width: 100%;
  max-width: 100%;
  background-color: white;
  border: none;
  font-family: Arial, Helvetica, sans-serif;

  .react-calendar__tile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80px;
  }

  .react-calendar__tile--now {
    background: #c0eaff;
    color: black;
  }

  .react-calendar__tile--active {
    background: #007bff;
    color: white;
  }

  .react-calendar__month-view__days__day {
    margin: 0.5rem;
    padding: 0.5rem;
    border-radius: 10px;
  }

  .react-calendar__month-view__days__day--weekend {
    background-color: #f8f9fa;
  }

  .react-calendar__month-view__weekdays {
    font-weight: bold;
  }
`;

const ScheduleManagerComponent = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("");

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDate(null);
    setWorkerName("");
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Creating schedule...");
    try {
      await addDoc(collection(db, "schedules"), {
        date: selectedDate,
        workerName,
        startTime,
        endTime,
        timestamp: new Date(),
      });
      setStatus("Schedule created successfully.");
      closeModal();
    } catch (error) {
      setStatus("Error creating schedule: " + error.message);
    }
  };

  return (
    <>
      <SupportNavBar />
      <Container>
        <Content>
          <Title>Schedule Manager</Title>
          <CustomCalendar
            onClickDay={handleDayClick}
            className="mb-6 react-calendar--large custom-calendar mt-12"
          />
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
              },
            }}
          >
            <Typography variant="h4" className="font-bold mb-4">
              Create Schedule for {selectedDate && selectedDate.toDateString()}
            </Typography>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Box>
                <TextField
                  label="Worker Name"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  fullWidth
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </Box>
              <Box>
                <TextField
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  fullWidth
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </Box>
              <Box>
                <TextField
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  fullWidth
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
        </Content>
      </Container>
    </>
  );
};

export default ScheduleManagerComponent;
