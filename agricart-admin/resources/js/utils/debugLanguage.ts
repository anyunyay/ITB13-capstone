/**
 * Debug utilities for language switching
 */

export function debugLanguageSwitch() {
    console.log('🔍 Debugging Language Switch...');
    
    // Check CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    console.log('CSRF Token:', csrfToken ? 'Present' : 'Missing');
    
    // Check current page props
    try {
        const inertiaPage = (window as any).page;
        console.log('Inertia Page Props:', inertiaPage?.props);
        console.log('Current Language:', inertiaPage?.props?.currentLanguage);
    } catch (error) {
        console.log('Inertia Page Error:', error);
    }
    
    // Test language route
    fetch('/language/current')
        .then(response => {
            console.log('Language Current Response Status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Language Current Data:', data);
        })
        .catch(error => {
            console.error('Language Current Error:', error);
        });
}

export function testLanguageSwitch(language: 'en' | 'fil') {
    console.log(`🧪 Testing Language Switch to: ${language}`);
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    fetch('/language/switch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ language }),
    })
    .then(response => {
        console.log('Language Switch Response Status:', response.status);
        console.log('Language Switch Response Headers:', response.headers);
        return response.text();
    })
    .then(text => {
        console.log('Language Switch Response Text:', text);
        try {
            const json = JSON.parse(text);
            console.log('Language Switch Response JSON:', json);
        } catch (e) {
            console.log('Response is not JSON');
        }
    })
    .catch(error => {
        console.error('Language Switch Error:', error);
    });
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    (window as any).debugLanguageSwitch = debugLanguageSwitch;
    (window as any).testLanguageSwitch = testLanguageSwitch;
}