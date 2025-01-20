import React, { useState } from 'react';

const QuestionCard = ({ question, onAnswer }) => {
    const [feedback, setFeedback] = useState(null);
    const [bgColor, setBgColor] = useState('bg-white'); // Default background color

    const handleAnswerClick = (isCorrect) => {
        setFeedback(isCorrect ? 'Correct!' : 'Incorrect');
        setBgColor(isCorrect ? 'bg-green-100' : 'bg-red-100'); // Change background color

        setTimeout(() => {
            setBgColor('bg-white'); // Reset background color with fade-out
        }, 1500); // Fade-out duration

        setTimeout(() => {
            setFeedback(null); // Clear feedback after 2 seconds
            onAnswer(isCorrect, question); // Move to the next question
        }, 2000);
    };

    const { question: questionText, options = [], answer } = question;

    return (
        <div
            className={`p-6 rounded shadow-md transition-colors duration-500 ease-in-out ${bgColor}`}
        >
            <h2 className="text-xl font-bold mb-4">{questionText}</h2>
            <ul className="space-y-2">
                {options.map((option, index) => (
                    <li key={index}>
                        <button
                            className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded"
                            onClick={() => handleAnswerClick(option === answer)}
                        >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>
            {/* Feedback Section */}
            <div
                className={`mt-4 min-h-[2rem] text-center font-bold text-lg transition-opacity duration-300 ${
                    feedback ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {feedback}
            </div>
        </div>
    );
};

export default QuestionCard;
