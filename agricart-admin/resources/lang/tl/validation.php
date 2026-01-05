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

    'accepted' => 'Dapat tanggapin ang :attribute field.',
    'accepted_if' => 'Dapat tanggapin ang :attribute field kapag ang :other ay :value.',
    'active_url' => 'Dapat valid URL ang :attribute field.',
    'after' => 'Dapat ang :attribute field ay petsa pagkatapos ng :date.',
    'after_or_equal' => 'Dapat ang :attribute field ay petsa pagkatapos o katumbas ng :date.',
    'alpha' => 'Dapat letters lamang ang laman ng :attribute field.',
    'alpha_dash' => 'Dapat letters, numbers, dashes, at underscores lamang ang laman ng :attribute field.',
    'alpha_num' => 'Dapat letters at numbers lamang ang laman ng :attribute field.',
    'array' => 'Dapat array ang :attribute field.',
    'ascii' => 'Dapat single-byte alphanumeric characters at symbols lamang ang laman ng :attribute field.',
    'before' => 'Dapat ang :attribute field ay petsa bago ang :date.',
    'before_or_equal' => 'Dapat ang :attribute field ay petsa bago o katumbas ng :date.',
    'between' => [
        'array' => 'Dapat may :min hanggang :max items ang :attribute field.',
        'file' => 'Dapat :min hanggang :max kilobytes ang :attribute field.',
        'numeric' => 'Dapat :min hanggang :max ang :attribute field.',
        'string' => 'Dapat :min hanggang :max characters ang :attribute field.',
    ],
    'boolean' => 'Dapat true o false ang :attribute field.',
    'can' => 'May unauthorized value ang :attribute field.',
    'confirmed' => 'Hindi tumugma ang :attribute field confirmation.',
    'contains' => 'May kulang na required value ang :attribute field.',
    'current_password' => 'Mali ang password.',
    'date' => 'Dapat valid date ang :attribute field.',
    'date_equals' => 'Dapat ang :attribute field ay petsa na katumbas ng :date.',
    'date_format' => 'Dapat tumugma sa format na :format ang :attribute field.',
    'decimal' => 'Dapat may :decimal decimal places ang :attribute field.',
    'declined' => 'Dapat declined ang :attribute field.',
    'declined_if' => 'Dapat declined ang :attribute field kapag ang :other ay :value.',
    'digits' => 'Dapat :digits digits ang :attribute field.',
    'digits_between' => 'Dapat :min hanggang :max digits ang :attribute field.',
    'dimensions' => 'May invalid image dimensions ang :attribute field.',
    'distinct' => 'May duplicate value ang :attribute field.',
    'doesnt_end_with' => 'Hindi dapat nagtatapos sa isa sa mga sumusunod ang :attribute field: :values.',
    'doesnt_start_with' => 'Hindi dapat nagsisimula sa isa sa mga sumusunod ang :attribute field: :values.',
    'email' => 'Dapat valid email address ang :attribute field.',
    'ends_with' => 'Dapat nagtatapos sa isa sa mga sumusunod ang :attribute field: :values.',
    'enum' => 'Hindi valid ang napiling :attribute.',
    'exists' => 'Hindi valid ang napiling :attribute.',
    'extensions' => 'Dapat may isa sa mga sumusunod na extensions ang :attribute field: :values.',
    'file' => 'Dapat file ang :attribute field.',
    'filled' => 'Dapat may value ang :attribute field.',
    'gt' => [
        'array' => 'Dapat may higit sa :value items ang :attribute field.',
        'file' => 'Dapat mas malaki sa :value kilobytes ang :attribute field.',
        'numeric' => 'Dapat mas malaki sa :value ang :attribute field.',
        'string' => 'Dapat mas mahaba sa :value characters ang :attribute field.',
    ],
    'gte' => [
        'array' => 'Dapat may :value items o higit pa ang :attribute field.',
        'file' => 'Dapat mas malaki o katumbas ng :value kilobytes ang :attribute field.',
        'numeric' => 'Dapat mas malaki o katumbas ng :value ang :attribute field.',
        'string' => 'Dapat mas mahaba o katumbas ng :value characters ang :attribute field.',
    ],
    'hex_color' => 'Dapat valid hexadecimal color ang :attribute field.',
    'image' => 'Dapat image ang :attribute field.',
    'in' => 'Hindi valid ang napiling :attribute.',
    'in_array' => 'Dapat umiiral sa :other ang :attribute field.',
    'integer' => 'Dapat integer ang :attribute field.',
    'ip' => 'Dapat valid IP address ang :attribute field.',
    'ipv4' => 'Dapat valid IPv4 address ang :attribute field.',
    'ipv6' => 'Dapat valid IPv6 address ang :attribute field.',
    'json' => 'Dapat valid JSON string ang :attribute field.',
    'list' => 'Dapat list ang :attribute field.',
    'lowercase' => 'Dapat lowercase ang :attribute field.',
    'lt' => [
        'array' => 'Dapat may mas kaunti sa :value items ang :attribute field.',
        'file' => 'Dapat mas maliit sa :value kilobytes ang :attribute field.',
        'numeric' => 'Dapat mas maliit sa :value ang :attribute field.',
        'string' => 'Dapat mas maikli sa :value characters ang :attribute field.',
    ],
    'lte' => [
        'array' => 'Hindi dapat may higit sa :value items ang :attribute field.',
        'file' => 'Dapat mas maliit o katumbas ng :value kilobytes ang :attribute field.',
        'numeric' => 'Dapat mas maliit o katumbas ng :value ang :attribute field.',
        'string' => 'Dapat mas maikli o katumbas ng :value characters ang :attribute field.',
    ],
    'mac_address' => 'Dapat valid MAC address ang :attribute field.',
    'max' => [
        'array' => 'Hindi dapat may higit sa :max items ang :attribute field.',
        'file' => 'Hindi dapat mas malaki sa :max kilobytes ang :attribute field.',
        'numeric' => 'Hindi dapat mas malaki sa :max ang :attribute field.',
        'string' => 'Hindi dapat mas mahaba sa :max characters ang :attribute field.',
    ],
    'max_digits' => 'Hindi dapat may higit sa :max digits ang :attribute field.',
    'mimes' => 'Dapat file type na :values ang :attribute field.',
    'mimetypes' => 'Dapat file type na :values ang :attribute field.',
    'min' => [
        'array' => 'Dapat may hindi bababa sa :min items ang :attribute field.',
        'file' => 'Dapat hindi bababa sa :min kilobytes ang :attribute field.',
        'numeric' => 'Dapat hindi bababa sa :min ang :attribute field.',
        'string' => 'Dapat hindi bababa sa :min characters ang :attribute field.',
    ],
    'min_digits' => 'Dapat may hindi bababa sa :min digits ang :attribute field.',
    'missing' => 'Dapat missing ang :attribute field.',
    'missing_if' => 'Dapat missing ang :attribute field kapag ang :other ay :value.',
    'missing_unless' => 'Dapat missing ang :attribute field maliban kung ang :other ay :value.',
    'missing_with' => 'Dapat missing ang :attribute field kapag present ang :values.',
    'missing_with_all' => 'Dapat missing ang :attribute field kapag present ang :values.',
    'multiple_of' => 'Dapat multiple ng :value ang :attribute field.',
    'not_in' => 'Hindi valid ang napiling :attribute.',
    'not_regex' => 'Hindi valid ang format ng :attribute field.',
    'numeric' => 'Dapat number ang :attribute field.',
    'password' => [
        'letters' => 'Dapat may hindi bababa sa isang letter ang :attribute field.',
        'mixed' => 'Dapat may hindi bababa sa isang uppercase at isang lowercase letter ang :attribute field.',
        'numbers' => 'Dapat may hindi bababa sa isang number ang :attribute field.',
        'symbols' => 'Dapat may hindi bababa sa isang symbol ang :attribute field.',
        'uncompromised' => 'Ang ibinigay na :attribute ay lumabas sa data leak. Mangyaring pumili ng ibang :attribute.',
    ],
    'present' => 'Dapat present ang :attribute field.',
    'present_if' => 'Dapat present ang :attribute field kapag ang :other ay :value.',
    'present_unless' => 'Dapat present ang :attribute field maliban kung ang :other ay :value.',
    'present_with' => 'Dapat present ang :attribute field kapag present ang :values.',
    'present_with_all' => 'Dapat present ang :attribute field kapag present ang :values.',
    'prohibited' => 'Bawal ang :attribute field.',
    'prohibited_if' => 'Bawal ang :attribute field kapag ang :other ay :value.',
    'prohibited_unless' => 'Bawal ang :attribute field maliban kung ang :other ay nasa :values.',
    'prohibits' => 'Pinipigilan ng :attribute field na maging present ang :other.',
    'regex' => 'Hindi valid ang format ng :attribute field.',
    'required' => 'Kailangan ang :attribute field.',
    'required_array_keys' => 'Dapat may entries para sa :values ang :attribute field.',
    'required_if' => 'Kailangan ang :attribute field kapag ang :other ay :value.',
    'required_if_accepted' => 'Kailangan ang :attribute field kapag tinanggap ang :other.',
    'required_if_declined' => 'Kailangan ang :attribute field kapag tinanggihan ang :other.',
    'required_unless' => 'Kailangan ang :attribute field maliban kung ang :other ay nasa :values.',
    'required_with' => 'Kailangan ang :attribute field kapag present ang :values.',
    'required_with_all' => 'Kailangan ang :attribute field kapag present ang :values.',
    'required_without' => 'Kailangan ang :attribute field kapag hindi present ang :values.',
    'required_without_all' => 'Kailangan ang :attribute field kapag wala sa :values ang present.',
    'same' => 'Dapat magkatugma ang :attribute at :other.',
    'size' => [
        'array' => 'Dapat may :size items ang :attribute field.',
        'file' => 'Dapat :size kilobytes ang :attribute field.',
        'numeric' => 'Dapat :size ang :attribute field.',
        'string' => 'Dapat :size characters ang :attribute field.',
    ],
    'starts_with' => 'Dapat nagsisimula sa isa sa mga sumusunod ang :attribute field: :values.',
    'string' => 'Dapat string ang :attribute field.',
    'timezone' => 'Dapat valid timezone ang :attribute field.',
    'unique' => 'Nakuha na ang :attribute.',
    'uploaded' => 'Hindi na-upload ang :attribute.',
    'uppercase' => 'Dapat uppercase ang :attribute field.',
    'url' => 'Dapat valid URL ang :attribute field.',
    'ulid' => 'Dapat valid ULID ang :attribute field.',
    'uuid' => 'Dapat valid UUID ang :attribute field.',

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