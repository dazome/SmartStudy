import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Register from "./pages/Register";
import UploadNote from "./pages/UploadNote";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Quiz from "./pages/Quiz";
import QuizHistory from "./pages/QuizHistory";
import Summary from "./pages/Summary";
import SavedSummaries from "./pages/SavedSummaries";
import QuizReview from "./pages/QuizReview";
import Flashcards from "./pages/Flashcards";
import MyFlashcards from "./pages/MyFlashcards";
import Profile from "./pages/Profile";

function App(){
  return(
    <BrowserRouter>
    <Routes>
       <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

         <Route element={ <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/upload" element={<UploadNote />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/quiz/:id/review" element={<QuizReview />}/>
        <Route path="/quiz-history" element={<QuizHistory />} />
        <Route path="/notes/:id/summary" element={<Summary />} />
        <Route path="/summaries" element={<SavedSummaries />}></Route>
        <Route path="/summaries/:id" element={<Summary />} />
        <Route path="/flashcards" element={<MyFlashcards />}/>
        <Route path="/flashcards/:id" element={<Flashcards />}/>
        <Route path="/profile" element={<Profile />}/>
        </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;