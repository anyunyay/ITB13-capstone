import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import { resolve } from 'node:path'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
})
