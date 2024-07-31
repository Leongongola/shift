"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { firebaseApp } from "../../utils/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import Modal from "react-modal";
import format from "date-fns/format";

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

const DateRangePicker = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const BackButton = styled(Button)`
  background-color: #6c757d;
  &:hover {
    background-color: #5a6268;
  }
  margin-bottom: 20px;
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

const WorkerHoursView = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");

  const [workers, setWorkers] = useState([]);
  const [workerHours, setWorkerHours] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "managers", user.uid, "workers"));
        const querySnapshot = await getDocs(q);
        const workerData = [];
        const workerHoursData = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          workerData.push({ id: doc.id, ...data });
          if (data.workData) {
            Object.keys(data.workData).forEach((date) => {
              if (!workerHoursData[date]) {
                workerHoursData[date] = [];
              }
              workerHoursData[date].push({
                workerId: doc.id,
                name: data.name,
                ...data.workData[date],
              });
            });
          }
        });
        setWorkers(workerData);
        setWorkerHours(workerHoursData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workers:", error);
        setError("Error fetching workers: " + error.message);
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [auth, db]);

  const filterByDateRange = () => {
    if (!startDate || !endDate) {
      console.warn("Start date or end date is missing.");
      return;
    }

    // Implement date range filtering logic here
  };

  const handleDayClick = (date) => {
    const dateString = date.toISOString().split("T")[0];
    setSelectedDate(date);
    setSelectedWorker(workerHours[dateString] || []);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDate(null);
    setSelectedWorker(null);
  };

  const goBack = () => {
    router.push(`/punchInOut?workerId=${workerId}`); // Adjust the route as needed
  };

  return (
    <Container>
      <Content>
        <BackButton onClick={goBack}>Back</BackButton>
        <Title>Worker Hours</Title>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <DateRangePicker>
              <div>
                <label>Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Start Date"
                  className="px-4 py-2 rounded-md"
                />
              </div>
              <div>
                <label>End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="End Date"
                  className="px-4 py-2 rounded-md"
                />
              </div>
              <Button onClick={filterByDateRange}>Filter</Button>
            </DateRangePicker>
            <CustomCalendar
              onClickDay={handleDayClick}
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const dateString = date.toISOString().split("T")[0];
                  if (workerHours[dateString]) {
                    return <div>🟢</div>; // Mark the day with work hours
                  }
                }
                return null;
              }}
            />
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              contentLabel="Worker Hours Details"
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
              <h2>
                Details for{" "}
                {selectedDate && format(selectedDate, "MMMM dd, yyyy")}
              </h2>
              <button onClick={closeModal}>Close</button>
              {selectedWorker && selectedWorker.length > 0 ? (
                selectedWorker.map((worker) => (
                  <div key={worker.workerId}>
                    <p>Worker: {worker.name}</p>
                    <p>Worked Hours: {worker.workHours}h</p>
                    <p>Break Hours: {worker.breakHours}h</p>
                    <p>Paid Hours: {worker.paidHours}h</p>
                    <hr />
                  </div>
                ))
              ) : (
                <p>No work hours recorded for this day.</p>
              )}
            </Modal>
          </>
        )}
      </Content>
    </Container>
  );
};

export default WorkerHoursView;
