import React, { useEffect, useState } from 'react';
import { trainModel, predictAttendance } from '../utils/AttendanceModel';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import ReactApexChart from 'react-apexcharts';

const AttendanceAnalytics = () => {
  const [predictions, setPredictions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');

  const getStreamsAndSubjects = async () => {
    const db = getFirestore();
    const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
    const streamsSet = new Set();
    const subjectsSet = new Set();

    sessionsSnapshot.forEach(doc => {
      const data = doc.data();
      streamsSet.add(data.stream);
      subjectsSet.add(data.subject);
    });

    return {
      streams: Array.from(streamsSet),
      subjects: Array.from(subjectsSet),
    };
  };

  const getNextSessionDate = async () => {
    const db = getFirestore();
    const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
    const dates = [];

    sessionsSnapshot.forEach(doc => {
      const data = doc.data();
      dates.push(new Date(data.date));
    });

    dates.sort((a, b) => a - b);
    const lastDate = dates[dates.length - 1];
    const nextSessionDate = new Date(lastDate);
    nextSessionDate.setDate(lastDate.getDate() + 1);

    return nextSessionDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchPredictions = async () => {
      await trainModel();
      const { streams, subjects } = await getStreamsAndSubjects();
      setStreams(streams);
      setSubjects(subjects);
      const nextSessionDate = await getNextSessionDate();

      const predictions = await Promise.all(
        streams.flatMap(stream =>
          subjects.map(async subject => {
            const { attendanceRate, enrolledCount, presentCount } = await predictAttendance(nextSessionDate, stream, subject);
            return {
              date: nextSessionDate,
              stream,
              subject,
              attendanceRate,
              enrolledCount,
              presentCount,
            };
          })
        )
      );
      setPredictions(predictions);
    };

    fetchPredictions();
  }, []);

  useEffect(() => {
    if (selectedStream) {
      const filteredPredictions = predictions.filter(prediction => prediction.stream === selectedStream);
      const newChartData = {};

      subjects.forEach(subject => {
        const subjectPredictions = filteredPredictions.filter(prediction => prediction.subject === subject);
        newChartData[subject] = {
          series: [
            {
              name: 'Enrolled Count',
              data: subjectPredictions.map(prediction => ({
                x: prediction.date,
                y: prediction.enrolledCount,
              })),
            },
            {
              name: 'Present Count',
              data: subjectPredictions.map(prediction => ({
                x: prediction.date,
                y: prediction.presentCount,
              })),
            },
          ],
          options: {
            chart: {
              type: 'bar',
              height: 200,
            },
            xaxis: {
              type: 'datetime',
              title: {
                text: 'Session Dates',
              },
            },
            yaxis: {
              title: {
                text: 'Count',
              },
            },
            colors: ['#008FFB', '#00E396'],
          },
        };
      });

      setChartData(newChartData);
    }
  }, [selectedStream, predictions, subjects]);

  return (
    <div>
      <h2>Attendance Predictions</h2>
      <div className="mb-3">
        <label htmlFor="streamSelect" className="form-label">Select Stream</label>
        <select
          id="streamSelect"
          className="form-select"
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
        >
          <option value="">Select Stream</option>
          {streams.map(stream => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>
      </div>
      {selectedStream && (
        <div className="row">
          {subjects.map(subject => (
            <div key={subject} className="col-xl-4 col-xxl-3 mb-4">
              <div className="card" id={`attendance_predictions_${subject}`}>
                <div className="card-header border-0 pb-0 d-sm-flex d-block">
                  <div>
                    <h4 className="mb-0 fs-20">Attendance Predictions for {selectedStream} - {subject}</h4>
                  </div>
                </div>
                <div className="card-body custome-tooltip">
                  {chartData[subject] && (
                    <ReactApexChart options={chartData[subject].options} series={chartData[subject].series} type="bar" height={200} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;