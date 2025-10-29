import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { useLanguageForm } from '@/hooks/useLanguageForm';
import { debugLanguageSwitch, testLanguageSwitch } from '@/utils/debugLanguage';

/**
 * Test component for language switching functionality
 * This helps debug and verify the language switching works correctly
 */
export function LanguageSwitchTest() {
    const [testResults, setTestResults] = useState<string[]>([]);
    const { language: currentLang, updateLanguage, isLoading } = useLanguage();
    const { language: formLang, updateLanguage: updateFormLanguage, isLoading: formLoading } = useLanguageForm();

    const addResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const testRouterMethod = async () => {
        try {
            addResult('🔄 Testing router method...');
            await updateLanguage(currentLang === 'en' ? 'fil' : 'en');
            addResult('✅ Router method successful');
        } catch (error) {
            addResult(`❌ Router method failed: ${error}`);
        }
    };

    const testFormMethod = async () => {
        try {
            addResult('🔄 Testing form method...');
            await updateFormLanguage(formLang === 'en' ? 'fil' : 'en');
            addResult('✅ Form method successful');
        } catch (error) {
            addResult(`❌ Form method failed: ${error}`);
        }
    };

    const testFetchMethod = () => {
        addResult('🔄 Testing fetch method...');
        testLanguageSwitch(currentLang === 'en' ? 'fil' : 'en');
    };

    const runDebug = () => {
        addResult('🔍 Running debug...');
        debugLanguageSwitch();
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Language Switch Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p><strong>Current Language (Router):</strong> {currentLang}</p>
                        <p><strong>Current Language (Form):</strong> {formLang}</p>
                        <p><strong>Router Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                        <p><strong>Form Loading:</strong> {formLoading ? 'Yes' : 'No'}</p>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button 
                        onClick={testRouterMethod} 
                        disabled={isLoading}
                        variant="outline"
                    >
                        Test Router Method
                    </Button>
                    <Button 
                        onClick={testFormMethod} 
                        disabled={formLoading}
                        variant="outline"
                    >
                        Test Form Method
                    </Button>
                    <Button 
                        onClick={testFetchMethod}
                        variant="outline"
                    >
                        Test Fetch Method
                    </Button>
                    <Button 
                        onClick={runDebug}
                        variant="secondary"
                    >
                        Run Debug
                    </Button>
                    <Button 
                        onClick={clearResults}
                        variant="destructive"
                        size="sm"
                    >
                        Clear Results
                    </Button>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Test Results:</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                        {testResults.length === 0 ? (
                            <p className="text-gray-500">No test results yet. Click a test button above.</p>
                        ) : (
                            testResults.map((result, index) => (
                                <div key={index} className="text-sm font-mono">
                                    {result}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="text-sm text-gray-600">
                    <p><strong>Instructions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Click "Run Debug" first to check the current state</li>
                        <li>Try each test method to see which one works</li>
                        <li>Check browser console for additional debug information</li>
                        <li>Check browser network tab for request details</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}