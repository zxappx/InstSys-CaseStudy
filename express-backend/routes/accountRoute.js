// routes/accountRoute.js
import express from "express";
import { loadStudents } from "../utils/RBAC.js";

const router = express.Router();

router.get("/account/:studentId", (req, res) => {
  const { studentId } = req.params;
  const students = loadStudents();

  const student = students[studentId];
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Split full name into parts
  const [firstName, middleName, ...lastParts] = student.studentName.split(" ");
  const lastName = lastParts.join(" ");

  return res.json({
    studentId,
    firstName,
    middleName,
    lastName,
    email: student.email,
    course: student.course,
    role: student.role,
  });
});

export default router;
