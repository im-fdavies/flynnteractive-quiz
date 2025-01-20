<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Traits\NotesReaderTrait;
use App\QuestionGenerator;
use Dotenv\Dotenv;
use League\CommonMark\CommonMarkConverter;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../', ['.env.local', '.env']);
$dotenv->load();

// Set headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

class NotesHandler
{
    use NotesReaderTrait;

    public function processMarkdownNotes(string $markdown): string
    {
        $converter = new CommonMarkConverter();
        $html = $converter->convertToHtml($markdown);

        // Optional: Strip HTML tags or further sanitize
        return strip_tags($html); // This returns plain text.
    }

    public function sanitizeInput(string $notes): string
    {
        // Remove non-essential markdown syntax
        $sanitized = preg_replace('/[#*>`\-$begin:math:display$$end:math:display$$begin:math:text$$end:math:text$\*_~]/', '', $notes);

        // Remove extra spaces or empty lines
        $sanitized = preg_replace('/\s+/', ' ', $sanitized);

        return trim($sanitized);
    }
}

// Function to handle JSON responses
function sendJsonResponse(array $data): void
{
    echo json_encode($data);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/import') {
        // Handle notes import
        $input = json_decode(file_get_contents('php://input'), true);
        $notes = $input['notes'] ?? '';

        if (!$notes) {
            sendJsonResponse(['success' => false, 'error' => 'No notes provided.']);
        }

        $openAiApiKey = $_ENV['OPENAI_API_KEY'] ?? '';
        $openAi = \OpenAI::client($openAiApiKey);
        $questionGenerator = new QuestionGenerator($openAi);

        $questions = $questionGenerator->generateQuestions($notes);

        sendJsonResponse(['success' => true, 'questions' => $questions]);
    }

    $notesHandler = new NotesHandler();
    $notesPath = __DIR__ . '/../notes/E4.txt'; // Markdown file

    if (!file_exists($notesPath)) {
        sendJsonResponse(['success' => false, 'error' => 'Notes file not found.']);
    }

// Read markdown notes
    $markdownNotes = $notesHandler->readNotes($notesPath);

// Process markdown into plain text
    $processedNotes = $notesHandler->processMarkdownNotes($markdownNotes);

// Sanitize the processed notes
    $sanitizedNotes = $notesHandler->sanitizeInput($processedNotes);

    $openAiApiKey = $_ENV['OPENAI_API_KEY'] ?? '';
    $openAi = \OpenAI::client($openAiApiKey);
    $questionGenerator = new QuestionGenerator($openAi);

    $questions = $questionGenerator->generateQuestions($sanitizedNotes);

    sendJsonResponse(['success' => true, 'questions' => $questions]);
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()]);
}
