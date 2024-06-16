// groqCall.js
import Groq from 'groq-sdk';

// Define the Message type
export function createGroqMessagesForTestCaseTitles(currentTicket, previousTickets) {
    const messages = [
        {
            role: "system",
            content: `You are a highly experienced Quality assurance engineer. The user will pass you the ticket description for new functionality and you need to generate concise test case titles specifying exact expectations, such as "Verify 'Login' button labeled as 'Sign In'"," Verify the username field is able to take input of alphanumeric characters" - DO NOT include conversational text in your replies`
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
        content: `Take a deep breath and go step by step, go through all the old tickets and join the dots with the current ticket and generate concise test case titles specifying exact expectations, example: "Verify 'Login' button labeled as 'Sign In'" for the current ticket,one after the other . Response format: Do not do categorisation or include conversational text in your reply, Ticket description:` + currentTicket
    });

    return messages;
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