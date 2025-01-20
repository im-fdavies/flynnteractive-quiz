import React from 'react';

const QuestionCard = ({ question, onAnswer }) => {
  return (
    <div>
      <h2 className="text-xl font-bold">{question.question}</h2>
      <ul className="mt-4">
        {question.answers.map((answer, index) => (
          <li key={index} className="mt-2">
            <button
              className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => onAnswer(index === question.correct)}
            >
              {answer}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionCard;
