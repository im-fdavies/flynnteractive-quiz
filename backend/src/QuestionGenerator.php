<?php

namespace App;

use OpenAI\Client;

class QuestionGenerator
{
    public function __construct(private Client $openAi)
    {
    }

    public function generateQuestions(string $notes): array
    {
        try {
            $response = $this->openAi->chat()->create([
                'model' => 'gpt-3.5-turbo', // or 'gpt-4'
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a quiz generator. Generate multiple-choice questions from the given notes. Return the result as a JSON array with the structure: [{"question": "...", "answers": ["...", "...", "..."], "correct": 0}].',
                    ],
                    [
                        'role' => 'user',
                        'content' => $notes,
                    ],
                ],
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            // Extract the content field
            $content = $response->choices[0]->message->content ?? null;

            if (!$content) {
                throw new \RuntimeException("API response is missing content.");
            }

            // Remove ```json and ``` if present
            $cleanedContent = preg_replace('/^```json\s*|\s*```$/', '', $content);

            // Decode the cleaned JSON string into an array
            $questions = json_decode($cleanedContent, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException("Failed to parse JSON: " . json_last_error_msg());
            }

            return $questions;
        } catch (\Exception $e) {
            throw new \RuntimeException("Failed to generate questions: " . $e->getMessage());
        }
    }
}
