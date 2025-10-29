/**
 * Simple test to verify translation system works
 * This can be run in browser console to test functionality
 */

import { translate } from '@/lib/i18n';
import { autoTranslate } from '@/utils/autoTranslate';
import { safeT, safeAuto } from '@/utils/safeTranslation';

export function testTranslations() {
    console.log('🧪 Testing Translation System...');
    
    // Test basic translation
    console.log('📝 Basic Translation Tests:');
    console.log('EN "Save":', translate('common.save', 'en'));
    console.log('FIL "Save":', translate('common.save', 'fil'));
    
    // Test auto-translation
    console.log('🔄 Auto-Translation Tests:');
    console.log('EN "Save" auto:', autoTranslate('Save', 'en'));
    console.log('FIL "Save" auto:', autoTranslate('Save', 'fil'));
    console.log('EN "Active" auto:', autoTranslate('Active', 'en'));
    console.log('FIL "Active" auto:', autoTranslate('Active', 'fil'));
    
    // Test safe functions
    console.log('🛡️ Safe Function Tests:');
    console.log('Safe T "common.save":', safeT('common.save', 'Save'));
    console.log('Safe Auto "Cancel":', safeAuto('Cancel'));
    
    // Test common patterns
    console.log('📋 Common Pattern Tests:');
    const commonTexts = ['Save', 'Cancel', 'Delete', 'Edit', 'Add', 'Active', 'Pending', 'Name', 'Email'];
    commonTexts.forEach(text => {
        console.log(`"${text}" -> EN: "${autoTranslate(text, 'en')}" | FIL: "${autoTranslate(text, 'fil')}"`);
    });
    
    console.log('✅ Translation tests completed!');
}

// Auto-run test if in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Uncomment to auto-test in development
    // setTimeout(testTranslations, 1000);
}