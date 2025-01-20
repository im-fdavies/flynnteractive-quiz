<?php

namespace App\Traits;

trait NotesReaderTrait
{
    public function readNotes(string $filePath): string
    {
        if (!file_exists($filePath)) {
            throw new \Exception("File not found: $filePath");
        }

        return file_get_contents($filePath);
    }
}
