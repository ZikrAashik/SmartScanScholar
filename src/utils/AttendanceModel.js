import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { NeuralNetwork } from 'brain.js';

const net = new NeuralNetwork();

export const trainModel = async () => {
  const querySnapshot = await getDocs(collection(db, 'sessions'));
  const trainingData = [];

  for (const docSnapshot of querySnapshot.docs) {
    const session = docSnapshot.data();
    const enrolledStudentsSnapshot = await getDocs(collection(db, `sessions/${docSnapshot.id}/enrolledStudents`));
    const presentCount = enrolledStudentsSnapshot.docs.filter(doc => doc.data().attendance === 'present').length;
    const attendanceRate = presentCount / enrolledStudentsSnapshot.size;
    trainingData.push({
      input: { date: new Date(session.date).getTime() / 1000000000000 },
      output: { attendanceRate },
    });
  }

  net.train(trainingData);
};

export const predictAttendance = async (date, stream, subject) => {
  const nextSessionDate = new Date(date).getTime() / 1000000000000;
  const prediction = net.run({ date: nextSessionDate });
  const enrolledCount = Math.round(prediction.attendanceRate * 100); // Mocked enrolled count
  const presentCount = Math.round(enrolledCount * prediction.attendanceRate); // Mocked present count
  return {
    attendanceRate: prediction.attendanceRate,
    enrolledCount,
    presentCount,
  };
};