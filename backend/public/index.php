<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Traits\NotesReaderTrait;
use App\QuestionGenerator;
use Dotenv\Dotenv;
use League\CommonMark\CommonMarkConverter;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../', ['.env.local', '.env']);
$dotenv->load();

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

        return strip_tags($html);
    }

    public function sanitizeInput(string $notes): string
    {
        // Remove markdown-related symbols and other unwanted characters
        $sanitized = preg_replace('/[#*>`\-$begin:math:display$$end:math:display$$begin:math:text$$end:math:text$\*_~]/', '', $notes);

        // Replace occurrences of $^2$ with <sup>2</sup> for superscripts
        $sanitized = preg_replace('/\$?\^(\d+)\$?/', '<sup>$1</sup>', $sanitized);

        // Remove extra spaces or empty lines
        $sanitized = preg_replace('/\s+/', ' ', $sanitized);

        // Trim the string
        return trim($sanitized);
    }
}

function sendJsonResponse(array $data): void
{
    echo json_encode($data);
    exit;
}

function saveQuestionsToFile(array $questions): string
{
    $dir = __DIR__ . '/../saved';
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $filePath = $dir . '/' . uniqid('questions_', true) . '.json';
    file_put_contents($filePath, json_encode($questions, JSON_PRETTY_PRINT));
    return $filePath;
}

function getMostRecentQuestions(): array
{
    $dir = __DIR__ . '/../saved';
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $files = array_diff(scandir($dir, SCANDIR_SORT_DESCENDING), ['.', '..']);
    foreach ($files as $file) {
        $content = json_decode(file_get_contents("$dir/$file"), true);
        if ($content) {
            return $content; // Return the first valid file's content
        }
    }

    return [];
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($_SERVER['REQUEST_URI'], '/saved') === 0) {
        $savedDirectory = __DIR__ . '/../saved/';

        // Check if a specific file is requested
        if (isset($_GET['fileName'])) {
            $fileName = basename($_GET['fileName']); // Sanitize input to prevent directory traversal
            $filePath = $savedDirectory . $fileName;

            if (!file_exists($filePath)) {
                sendJsonResponse(['success' => false, 'error' => 'File not found.']);
                exit;
            }

            $fileContents = file_get_contents($filePath);
            $questions = json_decode($fileContents, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                sendJsonResponse(['success' => false, 'error' => 'Invalid JSON in saved file.']);
                exit;
            }

            sendJsonResponse(['success' => true, 'questions' => $questions]);
            exit;
        }

        // Return a list of all saved files
        $files = array_diff(scandir($savedDirectory), ['.', '..']);
        sendJsonResponse(['success' => true, 'files' => array_values($files)]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/import') {
        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? 'untitled'; // Default to 'untitled' if no title is provided
        $notes = $input['notes'] ?? '';

        if (!$notes) {
            sendJsonResponse(['success' => false, 'error' => 'No notes provided.']);
        }

        $openAiApiKey = $_ENV['OPENAI_API_KEY'] ?? '';
        $openAi = \OpenAI::client($openAiApiKey);
        $questionGenerator = new QuestionGenerator($openAi);

        $questions = $questionGenerator->generateQuestions($notes);

        if (!is_dir(__DIR__ . '/../saved')) {
            mkdir(__DIR__ . '/../saved', 0777, true); // Create the directory if it doesn't exist
        }

        // Sanitize title for file name (remove spaces, special characters)
        $sanitizedTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $title);
        $fileName = 'questions_' . $sanitizedTitle . '--' . uniqid() . '.json';
        $filePath = __DIR__ . '/../saved/' . $fileName;

        file_put_contents($filePath, json_encode($questions, JSON_PRETTY_PRINT));

        sendJsonResponse(['success' => true, 'questions' => $questions]);
    }

    // Default: Return the most recent saved questions
    $recentQuestions = getMostRecentQuestions();

    if (!empty($recentQuestions)) {
        sendJsonResponse(['success' => true, 'questions' => $recentQuestions]);
    }

    // Fallback: Generate questions from default notes if no saved questions are found
    $notesHandler = new NotesHandler();
    $notesPath = __DIR__ . '/../notes/E4.txt';

    if (!file_exists($notesPath)) {
        sendJsonResponse(['success' => false, 'error' => 'Notes file not found.']);
    }

    $markdownNotes = $notesHandler->readNotes($notesPath);
    $processedNotes = $notesHandler->processMarkdownNotes($markdownNotes);
    $sanitizedNotes = $notesHandler->sanitizeInput($processedNotes);

    $openAiApiKey = $_ENV['OPENAI_API_KEY'] ?? '';
    $openAi = \OpenAI::client($openAiApiKey);
    $questionGenerator = new QuestionGenerator($openAi);

    $questions = $questionGenerator->generateQuestions($sanitizedNotes);

    saveQuestionsToFile($questions);
    sendJsonResponse(['success' => true, 'questions' => $questions]);
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()]);
}
