import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ScoreModal from './ScoreModal';

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions from the backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000'); // Replace with your backend URL
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch questions.');
        }

        setQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (isCorrect, question) => {
    setTotalAnswered(totalAnswered + 1);
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setIncorrectQuestions([...incorrectQuestions, question]);
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

  if (loading) {
    return <div className="text-center mt-10">Loading questions...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xl">
        <header className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">
            {totalAnswered}/{questions.length} Answered
          </div>
          <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setShowModal(true)}
          >
            Show Incorrect
          </button>
        </header>
        {questions.length > 0 && !showModal ? (
            <QuestionCard
                question={questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
            />
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
      </div>
  );
};

export default QuizApp;
