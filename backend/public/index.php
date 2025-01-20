<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Traits\NotesReaderTrait;
use App\QuestionGenerator;
use Dotenv\Dotenv;

// Load .env.local first, then fallback to .env
$dotenv = Dotenv::createImmutable(__DIR__ . '/../', ['.env.local', '.env']);
$dotenv->load();

header('Access-Control-Allow-Origin: http://localhost:5173'); // Allow requests from your frontend
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // Allow specific methods
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Allow specific headers
header('Content-Type: application/json'); // Set response type to JSON
class NotesHandler
{
    use NotesReaderTrait;
}

try {
    // Create a NotesHandler instance to use the trait
    $notesHandler = new NotesHandler();

    $notesPath = __DIR__ . '/../notes/E4.txt'; // Path to the notes file
    $notes = $notesHandler->readNotes($notesPath);
    $openAiApiKey = $_ENV['OPENAI_API_KEY'] ?? '';

    // Initialize the OpenAI client
    $openAi = \OpenAI::client($openAiApiKey);

    // Pass the client to the updated QuestionGenerator
    $questionGenerator = new QuestionGenerator($openAi);
    $questions = $questionGenerator->generateQuestions($notes);

    echo json_encode([
        'success' => true,
        'questions' => $questions,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
