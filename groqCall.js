// groqCall.js
import Groq from 'groq-sdk';

// Define the Message type
export function createGroqMessagesForTestCaseTitles(currentTicket, previousTickets) {
    const messages = [
        {
            role: "system",
            content: `You are a highly experienced Quality assurance engineer. The user will pass you the ticket description for new functionality and you need to generate test case titles for the functionality. Response Criterion: - Adhere strictly to the ticket descriptions - ONLY test cases titles - One line test case titles only - A sample test case title: " Verify the username field is able to take input of alphanumeric characters"`
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
        content: "Take a deep breath and go step by step, go through all the old tickets and join the dots with the current ticket and generate test cases for the current ticket, Ticket description:" + currentTicket
    });

    return messages;
}

export async function groqCall(userInput, previousTickets) {
    const groq = new Groq();
    const messages = createGroqMessagesForTestCaseTitles(userInput, previousTickets);
    console.log(messages)
    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        // model:"llama3-70b-8192",
        model: "mixtral-8x7b-32768",
        temperature: 0,
        max_tokens: 1024,
        top_p: 0,
        stream: false,
        stop: null
    });
    let response = chatCompletion.choices[0].message.content;
    return response;
}
