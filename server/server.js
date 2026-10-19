require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Smart Study Companion API is running!"
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query("SELECT UserId, FullName, Email, CreatedAt FROM Users");

    res.json(result.recordset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get users"
    });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required"
      });
    }

    const pool = await poolPromise;

    const existingUser = await pool
      .request()
      .input("Email", email)
      .query(`
        SELECT UserId
        FROM Users
        WHERE Email = @Email
      `);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("FullName", fullName)
      .input("Email", email)
      .input("PasswordHash", passwordHash)
      .query(`
        INSERT INTO Users
        (FullName, Email, PasswordHash)
        VALUES
        (@FullName, @Email, @PasswordHash)
      `);

    res.status(201).json({
      message: "Account created successfully"
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("Email", email)
      .query(`
        SELECT UserId, FullName, Email, PasswordHash
        FROM Users
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.recordset[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.PasswordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.UserId,
        name: user.FullName,
        email: user.Email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

app.get("/api/notes/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", userId)
      .query(`
        SELECT
          NoteId,
          UserId,
          Title,
          FileName,
          FilePath,
          UploadedAt
        FROM Notes
        WHERE UserId = @UserId
        ORDER BY UploadedAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get notes"
    });
  }
});

app.post("/api/notes", upload.single("file"), async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !userId || !req.file) {
      return res.status(400).json({
        message: "Title, userId and PDF file are required"
      });
    }

    const pool = await poolPromise;

    await pool
      .request()
      .input("UserId", userId)
      .input("Title", title)
      .input("FileName", req.file.originalname)
      .input("FilePath", req.file.path)
      .query(`
        INSERT INTO Notes
        (UserId, Title, FileName, FilePath)
        VALUES
        (@UserId, @Title, @FileName, @FilePath)
      `);

    res.status(201).json({
      message: "Note uploaded successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to upload note"
    });
  }
});


app.get("/api/notes/:id/text", async (req, res) => {
  try {
    const noteId = req.params.id;

    const pool = await poolPromise;

    const dbResult = await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        SELECT FilePath, Title
        FROM Notes
        WHERE NoteId = @NoteId
      `);

    if (dbResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    const note = dbResult.recordset[0];

    if (!fs.existsSync(note.FilePath)) {
      return res.status(404).json({
        message: "PDF file not found"
      });
    }

    const dataBuffer = fs.readFileSync(note.FilePath);

    const parser = new PDFParse({
      data: dataBuffer
    });

    const pdfResult = await parser.getText();

    await parser.destroy();

    res.json({
      title: note.Title,
      text: pdfResult.text
    });

  } catch (error) {
    console.error("PDF extraction error:", error);

    res.status(500).json({
      message: "Failed to extract PDF text",
      error: error.message
    });
  }
});


app.post("/api/notes/:id/summarize", async (req, res) => {
  try {
    const noteId = req.params.id;

    const pool = await poolPromise;

    const dbResult = await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        SELECT FilePath, Title
        FROM Notes
        WHERE NoteId = @NoteId
      `);


    if (dbResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }


    const note = dbResult.recordset[0];


    if (!fs.existsSync(note.FilePath)) {
      return res.status(404).json({
        message: "PDF file not found"
      });
    }


    
    const dataBuffer = fs.readFileSync(note.FilePath);


    const parser = new PDFParse({
      data: dataBuffer
    });


    const pdfResult = await parser.getText();

    await parser.destroy();


    const text = pdfResult.text;


    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "No text could be extracted from this PDF"
      });
    }



    const aiResponse = await fetch(
      "https://netarz.ir/api/ai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_API_KEY}`
        },

        body: JSON.stringify({

          model: "gpt-5-mini",

          messages: [
            {
              role: "system",
              content:
                "You are a study assistant. Summarize study materials clearly and concisely. Keep important concepts, definitions, and key points. Answer in the same language as the material."
            },

            {
              role: "user",
              content:
                `Summarize this study material:\n\n${text.substring(0, 8000)}`
            }
          ],


          max_completion_tokens: 3000

        })
      }
    );



    const aiText = await aiResponse.text();



    if (!aiResponse.ok) {

      return res.status(500).json({
        message: "Failed to generate summary",
        error: aiText
      });

    }



    const completion = JSON.parse(aiText);



    const summary =
      completion.choices?.[0]?.message?.content;



    if (!summary || summary.trim() === "") {

      return res.status(500).json({
        message: "AI returned an empty summary"
      });

    }



    
    res.json({

      title: note.Title,

      summary: summary

    });



  } catch (error) {

    console.error("AI Summary Error:", error);


    res.status(500).json({

      message: "Failed to generate summary",

      error: error.message

    });

  }
});

app.post("/api/summaries", async (req, res) => {
  try {
    const { noteId, userId, summaryText } = req.body;

    if (!noteId || !userId || !summaryText) {
      return res.status(400).json({
        message: "noteId, userId and summaryText are required"
      });
    }

    const pool = await poolPromise;

    const check = await pool
      .request()
      .input("NoteId", noteId)
      .input("UserId", userId)
      .query(`
    SELECT SummaryId
    FROM Summaries
    WHERE NoteId = @NoteId
    AND UserId = @UserId
  `);


    if (check.recordset.length > 0) {
      return res.json({
        exists: true,
        message: "Summary for this note already exists"
      });
    }

    const result = await pool
      .request()
      .input("NoteId", noteId)
      .input("UserId", userId)
      .input("SummaryText", summaryText)
      .query(`
        INSERT INTO Summaries
        (NoteId, UserId, SummaryText)

        OUTPUT INSERTED.SummaryId

        VALUES
        (@NoteId, @UserId, @SummaryText)
      `);

    res.status(201).json({
      message: "Summary saved successfully",
      summaryId: result.recordset[0].SummaryId
    });

  } catch (error) {
    console.error("Save Summary Error:", error);

    res.status(500).json({
      message: "Failed to save summary"
    });
  }
});

app.get("/api/summaries/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", userId)
      .query(`
       SELECT
  Summaries.SummaryId,
  Summaries.NoteId,
  Summaries.SummaryText,
  Summaries.CreatedAt,
  Notes.Title AS NoteTitle

FROM Summaries

INNER JOIN Notes
ON Summaries.NoteId = Notes.NoteId

WHERE Summaries.UserId = @UserId

ORDER BY Summaries.CreatedAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error("Get summaries error:", error);

    res.status(500).json({
      message: "Failed to get summaries"
    });
  }
});

app.delete("/api/summaries/:id", async (req, res) => {
  try {
    const summaryId = req.params.id;

    const pool = await poolPromise;

    await pool
      .request()
      .input("SummaryId", summaryId)
      .query(`
        DELETE FROM Summaries
        WHERE SummaryId = @SummaryId
      `);

    res.json({
      message: "Summary deleted successfully"
    });

  } catch (error) {

    console.error("Delete summary error:", error);

    res.status(500).json({
      message: "Failed to delete summary"
    });
  }
});

app.get("/api/summaries/:id", async (req, res) => {
  try {
    const summaryId = req.params.id;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("SummaryId", summaryId)
      .query(`
        SELECT
          Summaries.SummaryId,
          Summaries.NoteId,
          Summaries.SummaryText,
          Summaries.CreatedAt,
          Notes.Title AS NoteTitle
        FROM Summaries

        INNER JOIN Notes
        ON Summaries.NoteId = Notes.NoteId

        WHERE Summaries.SummaryId = @SummaryId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Summary not found"
      });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("Get summary error:", error);

    res.status(500).json({
      message: "Failed to get summary"
    });
  }
});
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const noteId = req.params.id;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        SELECT FilePath
        FROM Notes
        WHERE NoteId = @NoteId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    const filePath = result.recordset[0].FilePath;

    await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        DELETE FROM Summaries
        WHERE NoteId = @NoteId
      `);

    await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        DELETE FROM Flashcards
        WHERE FlashcardSetId IN (
          SELECT FlashcardSetId
          FROM FlashcardSets
          WHERE NoteId = @NoteId
        )
      `);

    await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        DELETE FROM FlashcardSets
        WHERE NoteId = @NoteId
      `);

    await pool
      .request()
      .input("NoteId", noteId)
      .query(`
        DELETE FROM Notes
        WHERE NoteId = @NoteId
      `);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: "Note deleted successfully"
    });

  } catch (error) {
    console.error("Delete note error:", error);

    res.status(500).json({
      message: "Failed to delete note"
    });
  }
});

app.post("/api/notes/:id/generate-quiz", async (req, res) => {
  try {
    const noteId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const pool = await poolPromise;

    const noteResult = await pool
      .request()
      .input("NoteId", noteId)
      .input("UserId", userId)
      .query(`
        SELECT NoteId, Title, FilePath
        FROM Notes
        WHERE NoteId = @NoteId
        AND UserId = @UserId
      `);

    if (noteResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    const note = noteResult.recordset[0];

    if (!fs.existsSync(note.FilePath)) {
      return res.status(404).json({
        message: "PDF file not found"
      });
    }

    const dataBuffer = fs.readFileSync(note.FilePath);

    const parser = new PDFParse({
      data: dataBuffer
    });

    const pdfResult = await parser.getText();

    await parser.destroy();

    const text = pdfResult.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "No text could be extracted from this PDF"
      });
    }

    const aiResponse = await fetch(
      "https://netarz.ir/api/ai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5-mini",

          messages: [
            {
              role: "system",
              content: `
You are a study quiz generator.

Create exactly 5 multiple-choice questions based ONLY on the study material.

Each question must have exactly 4 options: A, B, C, D.
There must be exactly one correct answer.

Use the same language as the study material.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Use exactly this format:

{
  "questions": [
    {
      "questionText": "Question",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "correctAnswer": "A"
    }
  ]
}
              `
            },

            {
              role: "user",
              content: `Create a quiz from this study material:\n\n${text.substring(0, 8000)}`
            }
          ],

          max_completion_tokens: 3000
        })
      }
    );

    const aiText = await aiResponse.text();

    if (!aiResponse.ok) {
      return res.status(500).json({
        message: "Failed to generate quiz",
        error: aiText
      });
    }

    const completion = JSON.parse(aiText);

    const content =
      completion.choices?.[0]?.message?.content;

    if (!content || content.trim() === "") {
      return res.status(500).json({
        message: "AI returned an empty quiz"
      });
    }

   
    const cleanContent = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let quizData;

    try {
      quizData = JSON.parse(cleanContent);
    } catch (error) {
      console.error("Quiz JSON parse error:", cleanContent);

      return res.status(500).json({
        message: "AI returned invalid quiz JSON"
      });
    }

    const questions = quizData.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        message: "AI did not generate valid questions"
      });
    }

    const quizResult = await pool
      .request()
      .input("UserId", userId)
      .input("Title", note.Title)
      .input("TotalQuestions", questions.length)
      .query(`
        INSERT INTO Quizzes
        (UserId, Title, TotalQuestions)

        OUTPUT INSERTED.QuizId

        VALUES
        (@UserId, @Title, @TotalQuestions)
      `);

    const quizId =
      quizResult.recordset[0].QuizId;

    for (const q of questions) {

      await pool
        .request()
        .input("QuizId", quizId)
        .input("QuestionText", q.questionText)
        .input("OptionA", q.optionA)
        .input("OptionB", q.optionB)
        .input("OptionC", q.optionC)
        .input("OptionD", q.optionD)
        .input("CorrectAnswer", q.correctAnswer)
        .query(`
          INSERT INTO Questions
          (
            QuizId,
            QuestionText,
            OptionA,
            OptionB,
            OptionC,
            OptionD,
            CorrectAnswer
          )

          VALUES
          (
            @QuizId,
            @QuestionText,
            @OptionA,
            @OptionB,
            @OptionC,
            @OptionD,
            @CorrectAnswer
          )
        `);
    }

    res.status(201).json({
      message: "Quiz generated successfully",
      quizId: quizId
    });

  } catch (error) {

    console.error(
      "AI Quiz Generation Error:",
      error
    );

    res.status(500).json({
      message: "Failed to generate quiz",
      error: error.message
    });

  }
});

app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quizId = req.params.id;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("QuizId", quizId)
      .query(`
          
      SELECT
        QuestionId,
        QuestionText,
        OptionA,
        OptionB,
        OptionC,
        OptionD,
        CorrectAnswer
      FROM Questions
      WHERE QuizId = @QuizId
      ORDER BY QuestionId
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load quiz"
    });
  }
});


app.post("/api/quizzes/:id/result", async (req, res) => {
  try {
    const quizId = req.params.id;
    const { score } = req.body;

    const pool = await poolPromise;

    await pool
      .request()
      .input("QuizId", quizId)
      .input("Score", score)
      .query(`
        UPDATE Quizzes
        SET Score = @Score
        WHERE QuizId = @QuizId
      `);

    res.json({
      message: "Quiz result saved successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to save quiz result"
    });
  }
});



app.get("/api/quizzes/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", userId)
      .query(`
        SELECT
          QuizId,
          Title,
          Score,
          TotalQuestions,
          CreatedAt
        FROM Quizzes
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load quiz history"
    });
  }
});

app.post("/api/questions/:id/answer", async (req, res) => {
  try {
    const questionId = req.params.id;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        message: "Answer is required"
      });
    }

    if (!["A", "B", "C", "D"].includes(answer)) {
      return res.status(400).json({
        message: "Invalid answer"
      });
    }

    const pool = await poolPromise;

    await pool
      .request()
      .input("QuestionId", questionId)
      .input("UserAnswer", answer)
      .query(`
        UPDATE Questions
        SET UserAnswer = @UserAnswer
        WHERE QuestionId = @QuestionId
      `);

    res.json({
      message: "Answer saved successfully"
    });

  } catch (error) {
    console.error("Save answer error:", error);

    res.status(500).json({
      message: "Failed to save answer"
    });
  }
});

app.get("/api/quizzes/:id/review", async (req, res) => {
  try {
    const quizId = req.params.id;

    const pool = await poolPromise;

    const quizResult = await pool
      .request()
      .input("QuizId", quizId)
      .query(`
        SELECT
          QuizId,
          Title,
          Score,
          TotalQuestions,
          CreatedAt
        FROM Quizzes
        WHERE QuizId = @QuizId
      `);

    if (quizResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

  
    const questionsResult = await pool
      .request()
      .input("QuizId", quizId)
      .query(`
        SELECT
          QuestionId,
          QuestionText,
          OptionA,
          OptionB,
          OptionC,
          OptionD,
          CorrectAnswer,
          UserAnswer
        FROM Questions
        WHERE QuizId = @QuizId
        ORDER BY QuestionId
      `);

    res.json({
      quiz: quizResult.recordset[0],
      questions: questionsResult.recordset
    });

  } catch (error) {

    console.error(
      "Quiz review error:",
      error
    );

    res.status(500).json({
      message: "Failed to load quiz review"
    });
  }
});

app.get("/api/dashboard/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", userId)
      .query(`
        SELECT
          (SELECT COUNT(*)
           FROM Notes
           WHERE UserId = @UserId) AS NotesCount,

          (SELECT COUNT(*)
           FROM Quizzes
           WHERE UserId = @UserId
           AND Score IS NOT NULL) AS QuizzesCount,

          (SELECT ISNULL(AVG(
              CAST(Score AS FLOAT) /
              NULLIF(TotalQuestions, 0) * 100
          ), 0)
           FROM Quizzes
           WHERE UserId = @UserId
           AND Score IS NOT NULL) AS AverageScore
      `);

    res.json(result.recordset[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard data"
    });
  }
});

app.get("/api/dashboard/:userId/recent-quizzes", async (req, res) => {
  try {
    const userId = req.params.userId;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", userId)
      .query(`
        SELECT TOP 5
          QuizId,
          Title,
          Score,
          TotalQuestions,
          CreatedAt
        FROM Quizzes
        WHERE UserId = @UserId
          AND Score IS NOT NULL
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load recent quizzes"
    });
  }
});

app.post("/api/notes/:id/generate-flashcards", async (req, res) => {
  try {
    const noteId = req.params.id;
    const { userId, count = "auto" } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const pool = await poolPromise;

    const noteResult = await pool
      .request()
      .input("NoteId", noteId)
      .input("UserId", userId)
      .query(`
        SELECT NoteId, Title, FilePath
        FROM Notes
        WHERE NoteId = @NoteId
        AND UserId = @UserId
      `);

    if (noteResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    const note = noteResult.recordset[0];

  
    const existingSet = await pool
      .request()
      .input("NoteId", noteId)
      .input("UserId", userId)
      .query(`
        SELECT FlashcardSetId
        FROM FlashcardSets
        WHERE NoteId = @NoteId
        AND UserId = @UserId
      `);

    if (existingSet.recordset.length > 0) {
      return res.json({
        exists: true,
        flashcardSetId:
          existingSet.recordset[0].FlashcardSetId,
        message:
          "Flashcards already exist for this note"
      });
    }

    if (!fs.existsSync(note.FilePath)) {
      return res.status(404).json({
        message: "PDF file not found"
      });
    }

    const dataBuffer = fs.readFileSync(note.FilePath);

    const parser = new PDFParse({
      data: dataBuffer
    });

    const pdfResult = await parser.getText();

    await parser.destroy();

    const text = pdfResult.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message:
          "No text could be extracted from this PDF"
      });
    }

    let flashcardCount;

    if (count === "auto") {
      if (text.length < 3000) {
        flashcardCount = 5;
      } else if (text.length < 8000) {
        flashcardCount = 10;
      } else {
        flashcardCount = 15;
      }
    } else {
      flashcardCount = Number(count);
    }

    if (![5, 10, 15].includes(flashcardCount)) {
      return res.status(400).json({
        message: "Invalid flashcard count"
      });
    }

    const aiResponse = await fetch(
      "https://netarz.ir/api/ai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5-mini",

          messages: [
            {
              role: "system",
              content: `
You are a study assistant that creates flashcards.

Create exactly ${flashcardCount} useful study flashcards based ONLY on the provided material.

Each flashcard must contain:
- frontText: a question, term, or concept
- backText: the correct answer or explanation

Focus on important definitions, concepts, facts, and study-worthy information.

Use the same language as the study material.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Return exactly:

{
  "flashcards": [
    {
      "frontText": "Question or concept",
      "backText": "Answer or explanation"
    }
  ]
}
              `
            },

            {
              role: "user",
              content:
                `Create flashcards from this study material:\n\n${text.substring(0, 12000)}`
            }
          ],

          max_completion_tokens: 4000
        })
      }
    );

    const aiText = await aiResponse.text();

    if (!aiResponse.ok) {
      return res.status(500).json({
        message: "Failed to generate flashcards",
        error: aiText
      });
    }

    const completion = JSON.parse(aiText);

    const content =
      completion.choices?.[0]?.message?.content;

    if (!content || content.trim() === "") {
      return res.status(500).json({
        message: "AI returned empty flashcards"
      });
    }

    const cleanContent = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let flashcardData;

    try {
      flashcardData = JSON.parse(cleanContent);
    } catch (error) {
      console.error(
        "Flashcard JSON parse error:",
        cleanContent
      );

      return res.status(500).json({
        message:
          "AI returned invalid flashcard JSON"
      });
    }

    const flashcards =
      flashcardData.flashcards;

    if (
      !Array.isArray(flashcards) ||
      flashcards.length === 0
    ) {
      return res.status(500).json({
        message:
          "AI did not generate valid flashcards"
      });
    }

    const setResult = await pool
      .request()
      .input("NoteId", noteId)
      .input("UserId", userId)
      .input("Title", note.Title )
      .query(`
        INSERT INTO FlashcardSets
        (NoteId, UserId, Title)

        OUTPUT INSERTED.FlashcardSetId

        VALUES
        (@NoteId, @UserId, @Title)
      `);

    const flashcardSetId =
      setResult.recordset[0].FlashcardSetId;


    for (const card of flashcards) {
      await pool
        .request()
        .input(
          "FlashcardSetId",
          flashcardSetId
        )
        .input(
          "FrontText",
          card.frontText
        )
        .input(
          "BackText",
          card.backText
        )
        .query(`
          INSERT INTO Flashcards
          (
            FlashcardSetId,
            FrontText,
            BackText
          )
          VALUES
          (
            @FlashcardSetId,
            @FrontText,
            @BackText
          )
        `);
    }

    res.status(201).json({
      message:
        "Flashcards generated successfully",
      flashcardSetId,
      count: flashcards.length
    });

  } catch (error) {
    console.error(
      "AI Flashcard Generation Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate flashcards",
      error: error.message
    });
  }
});


app.get("/api/flashcard-sets/:id", async (req, res) => {
  try {
    const flashcardSetId = req.params.id;

    const pool = await poolPromise;

    const setResult = await pool
      .request()
      .input(
        "FlashcardSetId",
        flashcardSetId
      )
      .query(`
        SELECT
          FlashcardSetId,
          NoteId,
          UserId,
          Title,
          CreatedAt
        FROM FlashcardSets
        WHERE FlashcardSetId = @FlashcardSetId
      `);

    if (setResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Flashcard set not found"
      });
    }

    const cardsResult = await pool
      .request()
      .input(
        "FlashcardSetId",
        flashcardSetId
      )
      .query(`
        SELECT
          FlashcardId,
          FrontText,
          BackText
        FROM Flashcards
        WHERE FlashcardSetId = @FlashcardSetId
        ORDER BY FlashcardId
      `);

    res.json({
      flashcardSet: setResult.recordset[0],
      flashcards: cardsResult.recordset
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load flashcards"
    });
  }
});

app.get(
  "/api/flashcard-sets/user/:userId",
  async (req, res) => {
    try {
      const userId = req.params.userId;

      const pool = await poolPromise;

      const result = await pool
        .request()
        .input("UserId", userId)
        .query(`
          SELECT
            FlashcardSets.FlashcardSetId,
            FlashcardSets.NoteId,
            FlashcardSets.Title,
            FlashcardSets.CreatedAt,
            COUNT(Flashcards.FlashcardId)
              AS CardCount

          FROM FlashcardSets

          LEFT JOIN Flashcards
          ON FlashcardSets.FlashcardSetId =
             Flashcards.FlashcardSetId

          WHERE FlashcardSets.UserId = @UserId

          GROUP BY
            FlashcardSets.FlashcardSetId,
            FlashcardSets.NoteId,
            FlashcardSets.Title,
            FlashcardSets.CreatedAt

          ORDER BY
            FlashcardSets.CreatedAt DESC
        `);

      res.json(result.recordset);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to load flashcard sets"
      });
    }
  }
);
app.delete("/api/flashcard-sets/:id", async (req, res) => {
  try {

    const flashcardSetId = req.params.id;

    const pool = await poolPromise;


    const result = await pool
      .request()
      .input(
        "FlashcardSetId",
        flashcardSetId
      )
      .query(`
        DELETE FROM FlashcardSets
        WHERE FlashcardSetId = @FlashcardSetId
      `);


    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Flashcard set not found"
      });
    }

    res.json({
      message:
        "Flashcard set deleted successfully"
    });


  } catch (error) {

    console.error(
      "Delete flashcard set error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete flashcard set"
    });

  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", userId)
      .query(`
        SELECT
          UserId,
          FullName,
          Email,
          CreatedAt
        FROM Users
        WHERE UserId = @UserId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to load profile"
    });
  }
});

app.use((error, req, res, next) => {
  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({
      message: "Only PDF files are allowed"
    });
  }

  console.error("Server error:", error);

  res.status(500).json({
    message: "Something went wrong"
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});