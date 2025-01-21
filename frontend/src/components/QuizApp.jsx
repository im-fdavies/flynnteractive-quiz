import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ScoreModal from './ScoreModal';
import ImportModal from './ImportModal';
import SavedQuestionsModal from './SavedQuestionsModal';

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSavedQuestionsModal, setShowSavedQuestionsModal] = useState(true);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMostRecentQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/saved');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch the most recent questions.');
        }

        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMostRecentQuestions();
  }, []);

  const handleAnswer = (isCorrect, question) => {
    setTotalAnswered((prev) => prev + 1);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setIncorrectQuestions((prev) => [...prev, question]);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setShowModal(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setTotalAnswered(0);
    setIncorrectQuestions([]);
    setCurrentQuestionIndex(0);
    setShowModal(false);
  };

  const handleImport = async (title, notes) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes }), // Include title in the request body
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process notes.');
      }

      setQuestions(data.questions || []);
      setShowImportModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedQuestions = async (fileName) => {
    try {
      setLoading(true);

      console.log("Loading file:", fileName); // Debug the file name

      const response = await fetch(`http://localhost:8000/saved?fileName=${encodeURIComponent(fileName)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load saved questions.');
      }

      setQuestions(data.questions || []);
      setShowSavedQuestionsModal(false);
      setTotalAnswered(0); // Reset answered count
      setCurrentQuestionIndex(0); // Start from the first question
      setScore(0); // Reset the score
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xl">
        <header className="flex justify-between items-center mb-4 border-b pb-2">
          <div className="text-lg font-bold">
            {totalAnswered}/{questions.length} Answered
          </div>
          <div className="flex space-x-2">
            <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowModal(true)}
            >
              Show Incorrect
            </button>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setShowSavedQuestionsModal(true)}
            >
              Saved Questions
            </button>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => setShowImportModal(true)}
            >
              Import Notes
            </button>
          </div>
        </header>
        {questions.length > 0 && !showModal ? (
            <QuestionCard question={questions[currentQuestionIndex]} onAnswer={handleAnswer} />
        ) : (
            <p>No questions available.</p>
        )}
        {showModal && (
            <ScoreModal
                score={score}
                total={questions.length}
                incorrectQuestions={incorrectQuestions}
                onRestart={restartQuiz}
                onClose={() => setShowModal(false)}
            />
        )}
        {showImportModal && (
            <ImportModal
                onSubmit={handleImport}
                onClose={() => setShowImportModal(false)}
            />
        )}
        {showSavedQuestionsModal && (
            <SavedQuestionsModal
                onSelect={(fileName) => loadSavedQuestions(fileName)} // Trigger fetch only here
                onClose={() => setShowSavedQuestionsModal(false)}
            />
        )}
      </div>
  );
};

export default QuizApp;
