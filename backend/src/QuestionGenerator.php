<?php

namespace App;

use OpenAI\Client;

class QuestionGenerator
{
    private Client $openAi;

    public function __construct(Client $openAi)
    {
        $this->openAi = $openAi;
    }

    public function generateQuestions(string $notes): array
    {
        try {
            $response = $this->openAi->chat()->create([
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an assistant that generates valid JSON-formatted multiple-choice questions. The input notes may be in markdown format. Ignore markdown formatting and focus on extracting relevant information for questions.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Generate exactly 5 multiple-choice questions based on the following notes. Each question should include a 'question', an 'options' array with 4 options, and an 'answer' indicating the correct option. Only return valid JSON with no explanations or additional text:\n\n" . $notes,
                    ],
                ],
                'max_tokens' => 1000,
                'temperature' => 0.5,
            ]);

            $content = $response->choices[0]->message->content ?? '';

            // Remove backticks or code block markers
            $content = preg_replace('/^```json|```$/m', '', $content);

            // Decode JSON
            $questions = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException('Invalid JSON: ' . json_last_error_msg());
            }

            // Ensure the structure is correct
            if (!isset($questions[0]['question'], $questions[0]['options'], $questions[0]['answer'])) {
                throw new \RuntimeException('Malformed questions structure.');
            }

            return $questions;
        } catch (\Exception $e) {
            error_log("Error generating questions: " . $e->getMessage());
            return [];
        }
    }
}
