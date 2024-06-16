// groqCall.js
import Groq from 'groq-sdk';

// Define the Message type
export function createGroqMessagesForTestCaseTitles(currentTicket, previousTickets) {
    const messages = [
        {
            role: "system",
            content: `You are testcase title generator,with no conversation skills. The user will pass you the ticket description for new functionality and you need to generate precise test case titles specifying exact expectations with exact page, such as "Verify 'Login' button labeled as 'Sign In' on the login page"," Verify the full name field is able to take input of alphanumeric characters" on form page - DO NOT include conversational text in your replies`
        },
    ];

    if (previousTickets && previousTickets.length > 0) {
      previousTickets.forEach(ticket => {
          messages.push({
              role: "user",
              content: `Previous Tickets: ${ticket.message}`
          });
      });
  }
    messages.push({
        role: "user",
        content: `Take a deep breath and  go through all the old tickets and join the dots with the current ticket and generate concise test case titles specifying exact expectations only for this ticket, example: "Verify 'Login' button labeled as 'Sign In'" for the current ticket,one after the other . Response format: Do not do categorisation or include conversational text in your reply, Ticket description:` + currentTicket
    });

    return messages;
}

export function createGroqMessagesForTestCaseSteps(summary,testCase,previousTickets) {
    const messages = [
        {
            role: "system",
            content: `You are a test case step generator bot,with no conversational skills. The user will pass you all ticket descriptions and a test case, you need to generate concise test steps specifying exact expectations, 
            example:
            test case title:
            Step: Enter in the username field: Shray.sharma
            Expected result: Verify that the value is shown in the username field is "Shray.sharma"
            Step: Enter password in the password field: Verygoodpassword123!
            Expected result: Verify that the password field has "Verygoodpassword123!" shown in it
            `

        },
    ];

    if (previousTickets && previousTickets.length > 0) {
      previousTickets.forEach(ticket => {
          messages.push({
              role: "user",
              content: `existing functionalities: ${ticket.message}`
          });
      });
  }
    messages.push({
        role: "user",
        content: `Take a deep breath and go through all the existing functionalities ,understand them and join the dots to understand how you will navigate to the page where the test needs to happen, then generate concise test case steps, you can find the ticket description by matching the summary in our older chat with this message's summary .
        Response format:
        - step: ....
        Expected result: ...
        - Every expected result should should start with the word "verify"
        - No conversational text
        - The user has already navigated to language page that step is not needed
        - dont send test case title in response

        Note: valid login credentials are :
        Username: apple
        Password : banana

        Test case title:
        ${testCase}
        Summary of the ticket: ${summary}`

        
    });

    return messages;
}

export async function groqCallCreateTestcaseSteps(testCase, previousTickets) {
    const groq = new Groq();
    const messages = createGroqMessagesForTestCaseSteps(testCase, previousTickets);
    console.log(messages)
    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        // model:"llama3-70b-8192",
        model: "llama3-70b-8192",
        temperature: 0,
        max_tokens: 1024,
        top_p: 0,
        stream: false,
        stop: null
    });
    let response = chatCompletion.choices[0].message.content;
    console.log(response)
    //response=await extractTestCases(response)
    return response;
}

export async function groqCallCreateTestcase(userInput, previousTickets) {
    const groq = new Groq();
    const messages = createGroqMessagesForTestCaseTitles(userInput, previousTickets);
    console.log(messages)
    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        // model:"llama3-70b-8192",
        model: "llama3-70b-8192",
        temperature: 0,
        max_tokens: 1024,
        top_p: 0,
        stream: false,
        stop: null
    });
    let response = chatCompletion.choices[0].message.content;
    console.log(response)
    response=await extractTestCases(response)
    return response;
}
function extractTestCases(reply) {
    // Extract the message from the JSON object
    let message = reply.trim();
  
    // Find the index of the first occurrence of "\n\n"
    let startIndex = message.indexOf("\n\n");
  
    // Check if "\n\n" is found and extract test cases accordingly
    if (startIndex !== -1) {
      // Extract everything after the first "\n\n"
      let testCases = message.substring(startIndex + 2).trim();
      return testCases;
    } else {
      // Return the entire message as test cases if "\n\n" is not found
      return message;
    }
  }