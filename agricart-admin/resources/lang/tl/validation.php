<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'Dapat tanggapin ang field na :attribute.',
    'accepted_if' => 'Dapat tanggapin ang field na :attribute kapag ang :other ay :value.',
    'active_url' => 'Dapat na valid URL ang field na :attribute.',
    'after' => 'Dapat na petsa na pagkatapos ng :date ang field na :attribute.',
    'after_or_equal' => 'Dapat na petsa na pagkatapos o katumbas ng :date ang field na :attribute.',
    'alpha' => 'Dapat na naglalaman lang ng mga titik ang field na :attribute.',
    'alpha_dash' => 'Dapat na naglalaman lang ng mga titik, numero, dash, at underscore ang field na :attribute.',
    'alpha_num' => 'Dapat na naglalaman lang ng mga titik at numero ang field na :attribute.',
    'array' => 'Dapat na array ang field na :attribute.',
    'ascii' => 'Dapat na naglalaman lang ng single-byte alphanumeric characters at symbols ang field na :attribute.',
    'before' => 'Dapat na petsa na bago ang :date ang field na :attribute.',
    'before_or_equal' => 'Dapat na petsa na bago o katumbas ng :date ang field na :attribute.',
    'between' => [
        'array' => 'Dapat na may :min hanggang :max na items ang field na :attribute.',
        'file' => 'Dapat na nasa pagitan ng :min at :max kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na nasa pagitan ng :min at :max ang field na :attribute.',
        'string' => 'Dapat na nasa pagitan ng :min at :max na karakter ang field na :attribute.',
    ],
    'boolean' => 'Dapat na true o false ang field na :attribute.',
    'can' => 'May unauthorized value ang field na :attribute.',
    'confirmed' => 'Hindi tumugma ang confirmation ng field na :attribute.',
    'contains' => 'Kulang ang field na :attribute ng required value.',
    'current_password' => 'Mali ang password.',
    'date' => 'Dapat na valid date ang field na :attribute.',
    'date_equals' => 'Dapat na petsa na katumbas ng :date ang field na :attribute.',
    'date_format' => 'Dapat na tumugma sa format na :format ang field na :attribute.',
    'decimal' => 'Dapat na may :decimal decimal places ang field na :attribute.',
    'declined' => 'Dapat na tanggihan ang field na :attribute.',
    'declined_if' => 'Dapat na tanggihan ang field na :attribute kapag ang :other ay :value.',
    'digits' => 'Dapat na :digits na digits ang field na :attribute.',
    'digits_between' => 'Dapat na nasa pagitan ng :min at :max na digits ang field na :attribute.',
    'dimensions' => 'May invalid image dimensions ang field na :attribute.',
    'distinct' => 'May duplicate value ang field na :attribute.',
    'doesnt_end_with' => 'Hindi dapat magtapos ang field na :attribute sa isa sa mga sumusunod: :values.',
    'doesnt_start_with' => 'Hindi dapat magsimula ang field na :attribute sa isa sa mga sumusunod: :values.',
    'email' => 'Dapat na valid email address ang field na :attribute.',
    'ends_with' => 'Dapat na magtapos ang field na :attribute sa isa sa mga sumusunod: :values.',
    'enum' => 'Invalid ang napiling :attribute.',
    'exists' => 'Invalid ang napiling :attribute.',
    'extensions' => 'Dapat na may isa sa mga sumusunod na extensions ang field na :attribute: :values.',
    'file' => 'Dapat na file ang field na :attribute.',
    'filled' => 'Dapat na may value ang field na :attribute.',
    'gt' => [
        'array' => 'Dapat na may higit pa sa :value na items ang field na :attribute.',
        'file' => 'Dapat na mas malaki sa :value kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na mas malaki sa :value ang field na :attribute.',
        'string' => 'Dapat na mas malaki sa :value na karakter ang field na :attribute.',
    ],
    'gte' => [
        'array' => 'Dapat na may :value na items o higit pa ang field na :attribute.',
        'file' => 'Dapat na mas malaki o katumbas ng :value kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na mas malaki o katumbas ng :value ang field na :attribute.',
        'string' => 'Dapat na mas malaki o katumbas ng :value na karakter ang field na :attribute.',
    ],
    'hex_color' => 'Dapat na valid hexadecimal color ang field na :attribute.',
    'image' => 'Dapat na image ang field na :attribute.',
    'in' => 'Invalid ang napiling :attribute.',
    'in_array' => 'Dapat na umiiral ang field na :attribute sa :other.',
    'integer' => 'Dapat na integer ang field na :attribute.',
    'ip' => 'Dapat na valid IP address ang field na :attribute.',
    'ipv4' => 'Dapat na valid IPv4 address ang field na :attribute.',
    'ipv6' => 'Dapat na valid IPv6 address ang field na :attribute.',
    'json' => 'Dapat na valid JSON string ang field na :attribute.',
    'list' => 'Dapat na list ang field na :attribute.',
    'lowercase' => 'Dapat na lowercase ang field na :attribute.',
    'lt' => [
        'array' => 'Dapat na may mas kaunti sa :value na items ang field na :attribute.',
        'file' => 'Dapat na mas maliit sa :value kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na mas maliit sa :value ang field na :attribute.',
        'string' => 'Dapat na mas maliit sa :value na karakter ang field na :attribute.',
    ],
    'lte' => [
        'array' => 'Dapat na walang higit pa sa :value na items ang field na :attribute.',
        'file' => 'Dapat na mas maliit o katumbas ng :value kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na mas maliit o katumbas ng :value ang field na :attribute.',
        'string' => 'Dapat na mas maliit o katumbas ng :value na karakter ang field na :attribute.',
    ],
    'mac_address' => 'Dapat na valid MAC address ang field na :attribute.',
    'max' => [
        'array' => 'Dapat na walang higit pa sa :max na items ang field na :attribute.',
        'file' => 'Dapat na hindi mas malaki sa :max kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na hindi mas malaki sa :max ang field na :attribute.',
        'string' => 'Dapat na hindi mas malaki sa :max na karakter ang field na :attribute.',
    ],
    'max_digits' => 'Dapat na walang higit pa sa :max na digits ang field na :attribute.',
    'mimes' => 'Dapat na file ng type: :values ang field na :attribute.',
    'mimetypes' => 'Dapat na file ng type: :values ang field na :attribute.',
    'min' => [
        'array' => 'Dapat na may hindi bababa sa :min na items ang field na :attribute.',
        'file' => 'Dapat na hindi bababa sa :min kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na hindi bababa sa :min ang field na :attribute.',
        'string' => 'Dapat na hindi bababa sa :min na karakter ang field na :attribute.',
    ],
    'min_digits' => 'Dapat na may hindi bababa sa :min na digits ang field na :attribute.',
    'missing' => 'Dapat na nawawala ang field na :attribute.',
    'missing_if' => 'Dapat na nawawala ang field na :attribute kapag ang :other ay :value.',
    'missing_unless' => 'Dapat na nawawala ang field na :attribute maliban kung ang :other ay :value.',
    'missing_with' => 'Dapat na nawawala ang field na :attribute kapag may :values.',
    'missing_with_all' => 'Dapat na nawawala ang field na :attribute kapag may :values.',
    'multiple_of' => 'Dapat na multiple ng :value ang field na :attribute.',
    'not_in' => 'Invalid ang napiling :attribute.',
    'not_regex' => 'Invalid ang format ng field na :attribute.',
    'numeric' => 'Dapat na numero ang field na :attribute.',
    'password' => [
        'letters' => 'Dapat na naglalaman ng hindi bababa sa isang titik ang field na :attribute.',
        'mixed' => 'Dapat na naglalaman ng hindi bababa sa isang uppercase at isang lowercase letter ang field na :attribute.',
        'numbers' => 'Dapat na naglalaman ng hindi bababa sa isang numero ang field na :attribute.',
        'symbols' => 'Dapat na naglalaman ng hindi bababa sa isang symbol ang field na :attribute.',
        'uncompromised' => 'Ang ibinigay na :attribute ay lumitaw sa data leak. Pakipili ang ibang :attribute.',
    ],
    'present' => 'Dapat na present ang field na :attribute.',
    'present_if' => 'Dapat na present ang field na :attribute kapag ang :other ay :value.',
    'present_unless' => 'Dapat na present ang field na :attribute maliban kung ang :other ay :value.',
    'present_with' => 'Dapat na present ang field na :attribute kapag may :values.',
    'present_with_all' => 'Dapat na present ang field na :attribute kapag may :values.',
    'prohibited' => 'Prohibited ang field na :attribute.',
    'prohibited_if' => 'Prohibited ang field na :attribute kapag ang :other ay :value.',
    'prohibited_unless' => 'Prohibited ang field na :attribute maliban kung ang :other ay nasa :values.',
    'prohibits' => 'Pinagbabawal ng field na :attribute ang :other na maging present.',
    'regex' => 'Invalid ang format ng field na :attribute.',
    'required' => 'Kailangan ang field na :attribute.',
    'required_array_keys' => 'Dapat na naglalaman ng entries para sa: :values ang field na :attribute.',
    'required_if' => 'Kailangan ang field na :attribute kapag ang :other ay :value.',
    'required_if_accepted' => 'Kailangan ang field na :attribute kapag tinanggap ang :other.',
    'required_if_declined' => 'Kailangan ang field na :attribute kapag tinanggihan ang :other.',
    'required_unless' => 'Kailangan ang field na :attribute maliban kung ang :other ay nasa :values.',
    'required_with' => 'Kailangan ang field na :attribute kapag may :values.',
    'required_with_all' => 'Kailangan ang field na :attribute kapag may :values.',
    'required_without' => 'Kailangan ang field na :attribute kapag walang :values.',
    'required_without_all' => 'Kailangan ang field na :attribute kapag walang :values.',
    'same' => 'Dapat na tumugma ang :attribute at :other.',
    'size' => [
        'array' => 'Dapat na naglalaman ng :size na items ang field na :attribute.',
        'file' => 'Dapat na :size kilobytes ang field na :attribute.',
        'numeric' => 'Dapat na :size ang field na :attribute.',
        'string' => 'Dapat na :size na karakter ang field na :attribute.',
    ],
    'starts_with' => 'Dapat na magsimula ang field na :attribute sa isa sa mga sumusunod: :values.',
    'string' => 'Dapat na string ang field na :attribute.',
    'timezone' => 'Dapat na valid timezone ang field na :attribute.',
    'unique' => 'Nagamit na ang :attribute.',
    'uploaded' => 'Nabigo ang pag-upload ng :attribute.',
    'uppercase' => 'Dapat na uppercase ang field na :attribute.',
    'url' => 'Dapat na valid URL ang field na :attribute.',
    'ulid' => 'Dapat na valid ULID ang field na :attribute.',
    'uuid' => 'Dapat na valid UUID ang field na :attribute.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "rule.attribute" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our custom validation
    | attributes. You are free to change them to anything
    | you want to customize your views to better match your application.
    |
    */

    'attributes' => [],
];

