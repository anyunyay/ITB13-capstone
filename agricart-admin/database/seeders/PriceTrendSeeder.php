<?php

namespace Database\Seeders;

use App\Models\PriceTrend;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PriceTrendSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priceData = [
            // June 1, 2025
            [
                'date' => '2025-06-01',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Sample Repetitive Data', 'price' => 40, 'unit' => 'kg'],
                    ['name' => 'Sample Repetitive Data 2', 'price' => 40, 'unit' => 'kg'],
                    ['name' => 'Sample Repetitive Data 3', 'price' => 40, 'unit' => 'kg'],
                    // Per 1 tali products
                    ['name' => 'Tanglad', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Talbos ng Kamote', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Alugbati', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Kangkong', 'price' => 8, 'unit' => 'tali'],
                    ['name' => 'Sample Repetitive Data', 'price' => 20, 'unit' => 'tali'],
                    ['name' => 'Sample Repetitive Data 2', 'price' => 20, 'unit' => 'tali'],
                    // Per 1 pc products
                    ['name' => 'Pakwan', 'price' => 52, 'unit' => 'pc'],
                    ['name' => 'Mais', 'price' => 17, 'unit' => 'pc'],
                    ['name' => 'Sample Repetitive Data', 'price' => 10, 'unit' => 'pc'],
                    ['name' => 'Sample Repetitive Data 3', 'price' => 10, 'unit' => 'pc'],
                ]
            ],
            // June 2, 2025
            [
                'date' => '2025-06-02',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Sitaw', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                ]
            ],
            // June 4, 2025
            [
                'date' => '2025-06-04',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 5, 2025
            [
                'date' => '2025-06-05',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 6, 2025
            [
                'date' => '2025-06-06',
                'products' => [
                    // No specific goods or prices listed for this date
                    ['name' => 'Sample Repetitive Data', 'price' => 30, 'unit' => 'kg'],
                    ['name' => 'Sample Repetitive Data', 'price' => 25, 'unit' => 'tali'],
                    ['name' => 'Sample Repetitive Data', 'price' => 20, 'unit' => 'pc'],
                ]
            ],
            // June 7, 2025
            [
                'date' => '2025-06-07',
                'products' => [
                    // Per 1 kg products
                    ['name' => 'Ampalaya', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 8, 2025
            [
                'date' => '2025-06-08',
                'products' => [
                    ['name' => 'Kalabasa', 'price' => 20, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                ]
            ],
            // June 9, 2025
            [
                'date' => '2025-06-09',
                'products' => [
                    ['name' => 'Sitaw', 'price' => 124, 'unit' => 'kg'],
                ]
            ],
            // June 10, 2025
            [
                'date' => '2025-06-10',
                'products' => [
                    ['name' => 'Sitaw', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 12, 2025
            [
                'date' => '2025-06-12',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 22, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                ]
            ],
            // June 14, 2025
            [
                'date' => '2025-06-14',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 15, 2025
            [
                'date' => '2025-06-15',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                ]
            ],
            // June 16, 2025
            [
                'date' => '2025-06-16',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 52, 'unit' => 'kg'],
                ]
            ],
            // June 17, 2025
            [
                'date' => '2025-06-17',
                'products' => [
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 78, 'unit' => 'kg'],
                ]
            ],
            // June 18, 2025
            [
                'date' => '2025-06-18',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 111, 'unit' => 'kg'],
                ]
            ],
            // June 19, 2025
            [
                'date' => '2025-06-19',
                'products' => [
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                ]
            ],
            // June 20, 2025
            [
                'date' => '2025-06-20',
                'products' => [
                    ['name' => 'Sitaw', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 98, 'unit' => 'kg'],
                ]
            ],
            // June 22, 2025
            [
                'date' => '2025-06-22',
                'products' => [
                    ['name' => 'Talong', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
                ]
            ],
            // June 24, 2025
            [
                'date' => '2025-06-24',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 72, 'unit' => 'kg'],
                ]
            ],
            // June 26, 2025
            [
                'date' => '2025-06-26',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 111, 'unit' => 'kg'],
                ]
            ],
            // June 29, 2025
            [
                'date' => '2025-06-29',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 85, 'unit' => 'kg'],
                ]
            ],
            // July 1, 2025
            [
                'date' => '2025-07-01',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 75, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 15, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 30, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 55, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 50, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 50, 'unit' => 'kg'],
                ]
            ],
            // July 2, 2025
            [
                'date' => '2025-07-02',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 20, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 104, 'unit' => 'kg'],
                ]
            ],
            // July 3, 2025
            [
                'date' => '2025-07-03',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 75, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 15, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 30, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 50, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 80, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 40, 'unit' => 'kg'],
                ]
            ],
            // July 4, 2025
            [
                'date' => '2025-07-04',
                'products' => [
                    ['name' => 'Talong', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ]
            ],

            // June 29, 2025
            [
                'date' => '2025-06-29',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 85, 'unit' => 'kg'],
                ],
            ],

            // July 1, 2025
            [
                'date' => '2025-07-01',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 75, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 15, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 30, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 55, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 50, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 50, 'unit' => 'kg'],
                ],
            ],

            // July 2, 2025
            [
                'date' => '2025-07-02',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 20, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 104, 'unit' => 'kg'],
                ],
            ],

            // July 3, 2025
            [
                'date' => '2025-07-03',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 75, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 15, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 30, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 50, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 80, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 40, 'unit' => 'kg'],
                ],
            ],

            // July 4, 2025
            [
                'date' => '2025-07-04',
                'products' => [
                    ['name' => 'Talong', 'price' => 70, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ],
            ],

            // July 6, 2025
            [
                'date' => '2025-07-06',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 23, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 26, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // July 8, 2025
            [
                'date' => '2025-07-08',
                'products' => [
                    ['name' => 'Pipino', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ],
            ],

            // July 9, 2025
            [
                'date' => '2025-07-09',
                'products' => [
                    ['name' => 'Kalabasa', 'price' => 20, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // July 10, 2025
            [
                'date' => '2025-07-10',
                'products' => [
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ],
            ],

            // July 11, 2025
            [
                'date' => '2025-07-11',
                'products' => [
                    ['name' => 'Pechay', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // July 12, 2025
            [
                'date' => '2025-07-12',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 124, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 104, 'unit' => 'kg'],
                ],
            ],

            // July 13, 2025
            [
                'date' => '2025-07-13',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 43, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 65, 'unit' => 'kg'],
                ],
            ],

            // July 14, 2025
            [
                'date' => '2025-07-14',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 26, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ],
            ],

            // July 16, 2025
            [
                'date' => '2025-07-16',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                ],
            ],

            // July 17, 2025
            [
                'date' => '2025-07-17',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 130, 'unit' => 'kg'],
                ],
            ],

            // July 18, 2025
            [
                'date' => '2025-07-18',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // July 19, 2025
            [
                'date' => '2025-07-19',
                'products' => [
                    ['name' => 'Pechay', 'price' => 33, 'unit' => 'kg'],
                ],
            ],

            // July 21, 2025
            [
                'date' => '2025-07-21',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 26, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 325, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ],
            ],

            // July 22, 2025
            [
                'date' => '2025-07-22',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 59, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 390, 'unit' => 'kg'],
                ],
            ],

            // July 23, 2025
            [
                'date' => '2025-07-23',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // July 25, 2025
            [
                'date' => '2025-07-25',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 26, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 403, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 195, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 52, 'unit' => 'kg'],
                ],
            ],

            // July 26, 2025
            [
                'date' => '2025-07-26',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 20, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // June 27, 2025
            [
                'date' => '2025-06-27',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 117, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 143, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 390, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 169, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Mais', 'price' => 16, 'unit' => 'pc'],
                ],
            ],

            // June 28, 2025
            [
                'date' => '2025-06-28',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 169, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 169, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 325, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 124, 'unit' => 'kg'],
                ],
            ],

            // July 29, 2025
            [
                'date' => '2025-07-29',
                'products' => [
                    ['name' => 'Pechay', 'price' => 195, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 520, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 195, 'unit' => 'kg'],
                ],
            ],

            // July 30, 2025
            [
                'date' => '2025-07-30',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 111, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 85, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 52, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 59, 'unit' => 'kg'],
                ],
            ],

            // July 31, 2025
            [
                'date' => '2025-07-31',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 182, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 46, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 130, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 98, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 65, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 520, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 182, 'unit' => 'kg'],
                ],
            ],

            // November 12, 2025
            [
                'date' => '2025-11-12',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 39, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 650, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 364, 'unit' => 'kg'],
                    ['name' => 'Kamatis', 'price' => 195, 'unit' => 'kg'],
                ],
            ],

            // November 13, 2025
            [
                'date' => '2025-11-13',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 208, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 33, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 104, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 364, 'unit' => 'kg'],
                ],
            ],

            // November 15, 2025
            [
                'date' => '2025-11-15',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 221, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 78, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 91, 'unit' => 'kg'],
                    ['name' => 'Pipino', 'price' => 72, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 585, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 234, 'unit' => 'kg'],
                ],
            ],

            // November 16, 2025
            [
                'date' => '2025-11-16',
                'products' => [
                    ['name' => 'Ampalaya', 'price' => 208, 'unit' => 'kg'],
                    ['name' => 'Kalabasa', 'price' => 13, 'unit' => 'kg'],
                    ['name' => 'Sitaw', 'price' => 169, 'unit' => 'kg'],
                    ['name' => 'Talong', 'price' => 143, 'unit' => 'kg'],
                    ['name' => 'Pechay', 'price' => 156, 'unit' => 'kg'],
                    ['name' => 'Siling Labuyo', 'price' => 520, 'unit' => 'kg'],
                    ['name' => 'Siling Haba', 'price' => 169, 'unit' => 'kg'],
                ],
            ],
        ];

        foreach ($priceData as $dayData) {
            foreach ($dayData['products'] as $product) {
                PriceTrend::create([
                    'product_name' => $product['name'],
                    'date' => $dayData['date'],
                    'price_per_kg' => $product['unit'] === 'kg' ? $product['price'] : null,
                    'price_per_tali' => $product['unit'] === 'tali' ? $product['price'] : null,
                    'price_per_pc' => $product['unit'] === 'pc' ? $product['price'] : null,
                    'unit_type' => $product['unit'],
                ]);
            }
        }
    }
}
