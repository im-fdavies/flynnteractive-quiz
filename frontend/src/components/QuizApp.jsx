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

  useEffect(() => {
    fetch('/questions.json')
        .then((res) => res.json())
        .then((data) => setQuestions(data));
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
            <p>Loading questions...</p>
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
