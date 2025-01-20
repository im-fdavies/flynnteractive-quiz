import React, { useState } from 'react';

const ImportModal = ({ onSubmit, onClose }) => {
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (notes.trim()) {
            onSubmit(notes);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">Import Notes</h2>
                <textarea
                    className="w-full border rounded p-2 mb-4"
                    rows="6"
                    placeholder="Paste your notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex justify-end">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
