import axios from 'axios';
// Replace these with your JIRA/Zephyr details
const projectKey = 'SCRUM';
const authKey='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL3NoYXJtYXNocmF5OTIuYXRsYXNzaWFuLm5ldCIsInVzZXIiOnsiYWNjb3VudElkIjoiNjAzZGYwMzMyMDEyMmIwMDY4NmVlYjQ2In19LCJpc3MiOiJjb20ua2Fub2FoLnRlc3QtbWFuYWdlciIsInN1YiI6Ijk1NTUzZGNmLTFlZDctM2FmYi05NDFlLWU0MmM1MTRjNGYxMSIsImV4cCI6MTc0NzEzNjI5MiwiaWF0IjoxNzE1NjAwMjkyfQ.XHW8_gbynwCQXfYaKlPCYCQRJLDOw_hJ4_yoWEwP888'

// Zephyr API endpoint
const zephyrApiBaseUrl = `https://api.zephyrscale.smartbear.com/v2`;



// Function to create a test case in Zephyr
export async function createTestCase(testCaseTitle,testCaseWithSteps) {
    const zephyrApiUrl=zephyrApiBaseUrl+"/testcases"
    console.log(testCaseWithSteps)
    const testCaseData= await createTestCaseTitleCall(testCaseTitle)
    try {
        console.log(testCaseData)
        const response = await axios.post(zephyrApiUrl, testCaseData, {
            headers: {
                'Authorization': authKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('Test case created successfully:', response.data);
        await addTestStepsToTestCase(response.data.key,testCaseWithSteps);
    } catch (error) {
        console.error('Error creating test case:', error.response ? error.response.data : error.message);
    }
    
}

async function createTestCaseTitleCall(testCaseTitle){
    // Create test case data
    const testCaseData = {
        "projectKey": projectKey,
        "name": testCaseTitle,
    };
    return testCaseData;
    }

    function extractSteps(groqResponse) {
        const lines = groqResponse.split('\n');
        const steps = [];
    
        for (let i = 0; i < lines.length; i += 2) {
            if (i + 1 < lines.length) {
                const step = lines[i].replace('Step: ', '').trim();
                const expectedResult = lines[i + 1].replace('Expected result: ', '').trim();
                steps.push({ step, expectedResult });
            }
        }
    
        return steps;
    }

// Function to create test steps structure for Zephyr Scale
function createTestSteps(steps) {
    const testSteps = steps.map(({ step, expectedResult }, index) => ({
        inline: {
            description: step,
            expectedResult: expectedResult
        }
    }));

    return testSteps;
}

// Function to add test steps to a test case in Zephyr Scale
async function addTestStepsToTestCase(testCaseKey, groqResponse) {
    const steps=extractSteps(groqResponse)
    const testSteps=await createTestSteps(steps)
    const requestBody = {
        mode: 'OVERWRITE', // Choose APPEND or OVERWRITE 
        items: testSteps
    };
    const zephyrApiUrlTestSteps=zephyrApiBaseUrl+"/testcases/"+testCaseKey+"/teststeps"
    try {
        const response = await axios.post(zephyrApiUrlTestSteps, requestBody, {
            headers: {
                'Authorization': authKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('Test steps added successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding test steps:', error.response ? error.response.data : error.message);
        throw new Error(`Error adding test steps to test case ${testCaseKey}: ${error.message}`);
    }
}

