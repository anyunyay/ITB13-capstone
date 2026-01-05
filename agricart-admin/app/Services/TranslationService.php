<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Lang;

class TranslationService
{
    /**
     * Get all translations for a specific locale, organized by namespace
     * 
     * @param string $locale
     * @return array
     */
    public static function getAllTranslations(string $locale): array
    {
        $translations = [];
        $langPath = resource_path('lang/' . $locale);

        if (!File::exists($langPath)) {
            return $translations;
        }

        // Get all PHP files in the language directory
        $files = File::files($langPath);

        foreach ($files as $file) {
            $namespace = $file->getFilenameWithoutExtension();
            
            // Skip vendor translations, only use our app translations
            if (strpos($namespace, '.') !== false) {
                continue;
            }

            try {
                $translations[$namespace] = Lang::get($namespace, [], $locale);
            } catch (\Exception $e) {
                // If translation doesn't exist, skip it
                continue;
            }
        }

        return $translations;
    }

    /**
     * Get translations for a specific namespace in a locale
     * 
     * @param string $namespace
     * @param string $locale
     * @return array
     */
    public static function getNamespaceTranslations(string $namespace, string $locale): array
    {
        try {
            return Lang::get($namespace, [], $locale);
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get all available locales
     * 
     * @return array
     */
    public static function getAvailableLocales(): array
    {
        $langPath = resource_path('lang');
        
        if (!File::exists($langPath)) {
            return ['en'];
        }

        $directories = File::directories($langPath);
        $locales = [];

        foreach ($directories as $directory) {
            $locale = basename($directory);
            if ($locale !== 'vendor') {
                $locales[] = $locale;
            }
        }

        return empty($locales) ? ['en'] : $locales;
    }
}

