import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Equivalent of Flask's __file__ logic
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store last logged-in role
const ROLE_ASSIGN_FILE = path.join(__dirname, "../config/last_role_assign.json");

// 🧠 POST /chatprompt — handle AI query
router.post("/chatprompt", async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const userQuery = data.query;

    // Placeholder for your AI logic
    // In Flask: ai.web_start_ai_analyst(user_query=user_query)
    const finalAnswer = await ai.web_start_ai_analyst(userQuery);

    res.json({ response: finalAnswer });
  } catch (error) {
    console.error("Error in /chatprompt:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🧩 Equivalent of map_student_role()
export function mapStudentRole(studentRole) {
  const mapping = {
    "student CS": ["teaching_faculty", ["BSCS"]],
    "student IT": ["teaching_faculty", ["BSIT"]],
    "student HM": ["teaching_faculty", ["BSHM"]],
    "student TM": ["teaching_faculty", ["BSTM"]],
    "student OAd": ["teaching_faculty", ["BSOAd"]],
    "student ECED": ["teaching_faculty", ["BECEd"]],
    "student TLEd": ["teaching_faculty", ["BTLEd"]],
    "faculty": ["Faculty", ["Faculty"]],
    "Guest": ["Guest", ["Guest"]],
    "student": ["Student", []], // fallback
  };

  return mapping[studentRole] || ["Student", []];
}

export default router;
