(function () {
  document.head.insertAdjacentHTML('beforeend', '<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css" rel="stylesheet">');

  // Inject the CSS
  const style = document.createElement('style');
  style.innerHTML = `
  .hidden {
    display: none;
  }
  #chat-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    flex-direction: column;
  }
  #chat-popup {
    height: 40vh;
    max-height: 70vh;
    transition: all 0.3s;
    overflow: hidden;
  }
  @media (max-width: 768px) {
    #chat-popup {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-height: 100%;
      border-radius: 0;
    }
  }
  `;

  document.head.appendChild(style);

  // Create chat widget container
  const chatWidgetContainer = document.createElement('div');
  chatWidgetContainer.id = 'chat-widget-container';
  document.body.appendChild(chatWidgetContainer);

  // Inject the HTML
  chatWidgetContainer.innerHTML = `
    <div id="chat-bubble" class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer text-3xl">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
    <div id="chat-popup" class="hidden absolute bottom-20 right-0 w-96 bg-white rounded-md shadow-md flex flex-col transition-all text-sm">
      <div id="chat-header" class="flex justify-between items-center p-4 bg-gray-800 text-white rounded-t-md">
        <h3 class="m-0 text-lg">Course Selection Chatbot</h3>
        <button id="close-popup" class="bg-transparent border-none text-white cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div id="chat-messages" class="flex-1 p-4 overflow-y-auto"></div>
      <div id="chat-input-container" class="p-4 border-t border-gray-200">
        <div class="flex space-x-4 items-center">
          <input type="text" id="chat-input" class="flex-1 border border-gray-300 rounded-md px-4 py-2 outline-none w-3/4" placeholder="Type your message...">
          <button id="chat-submit" class="bg-gray-800 text-white rounded-md px-4 py-2 cursor-pointer">Send</button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const chatInput = document.getElementById('chat-input');
  const chatSubmit = document.getElementById('chat-submit');
  const chatMessages = document.getElementById('chat-messages');
  const chatBubble = document.getElementById('chat-bubble');
  const chatPopup = document.getElementById('chat-popup');
  const closePopup = document.getElementById('close-popup');

  chatSubmit.addEventListener('click', function () {
    const message = chatInput.value.trim();
    if (!message) return;

    displayUserMessage(message);
    chatInput.value = '';

    if (currentPromptId) {
      handlePromptResponse(message);
    } else {
      fetchOpenAIResponse(message);
    }
  });

  chatInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      chatSubmit.click();
    }
  });

  chatBubble.addEventListener('click', function () {
    togglePopup();
  });

  closePopup.addEventListener('click', function () {
    togglePopup();
  });

  function togglePopup() {
    const chatPopup = document.getElementById('chat-popup');
    chatPopup.classList.toggle('hidden');
    if (!chatPopup.classList.contains('hidden')) {
      document.getElementById('chat-input').focus();
    }
  }

  function displayUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'flex justify-end mb-3';
    messageElement.innerHTML = `
      <div class="bg-gray-800 text-white rounded-lg py-2 px-4 max-w-[70%]">
        ${message}
      </div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function displayAssistantMessage(message) {
    const replyElement = document.createElement('div');
    replyElement.className = 'flex mb-3';
    replyElement.innerHTML = `
      <div class="bg-gray-200 text-black rounded-lg py-2 px-4 max-w-[70%]">
        ${message}
      </div>
    `;
    chatMessages.appendChild(replyElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Initialize variables
  let currentPromptId = '1';

  const prompts = [
    {
      id: '1',
      prompt: 'What is your preferred field of study?',
      options: ['Computer Science', 'Business', 'Healthcare', 'Art & Design'],
      next: {
        'Computer Science': '2',
        'Business': '3',
        'Healthcare': '4',
        'Art & Design': '5'
      }
    },
    {
      id: '2',
      prompt: 'Do you have any programming experience?',
      options: ['Yes', 'No'],
      next: {
        'Yes': '6',
        'No': '7'
      }
    },
    // Add more prompts here...
  ];

  function handlePromptResponse(message) {
    const currentPrompt = prompts.find(p => p.id === currentPromptId);
    if (currentPrompt && currentPrompt.options.includes(message)) {
      const nextPromptId = currentPrompt.next[message];
      const nextPrompt = prompts.find(p => p.id === nextPromptId);
      if (nextPrompt) {
        currentPromptId = nextPromptId;
        displayAssistantMessage(nextPrompt.prompt);
        nextPrompt.options.forEach(option => {
          displayAssistantMessage(`- ${option}`);
        });
      } else {
        // Handle final recommendation or end of prompts
        currentPromptId = null;
        displayAssistantMessage('Thank you for your responses. Here are the recommended courses:');
        // Replace this with actual course recommendation logic
        displayAssistantMessage('Course 1: Introduction to Computer Science');
        displayAssistantMessage('Course 2: Advanced Business Management');
      }
    } else {
      // If the response is not recognized, prompt the user again or switch to free text question handling
      fetchOpenAIResponse(message);
    }
  }

  function fetchOpenAIResponse(userMessage) {
    fetch('https://api-test.ecornell.cornell.edu/chat-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        chat: [{ role: "user", content: userMessage }],
        temperature: 0.7
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('API response:', data);
        if (data.chat) {
          const assistantMessage = data.chat;
          displayAssistantMessage(assistantMessage);
        } else {
          throw new Error('Unexpected API response format');
        }
      })
      .catch(error => {
        console.error('Error fetching OpenAI response:', error);
        displayAssistantMessage('Sorry, there was an error processing your request.');
      });
  }

  // Start the conversation with the initial prompt
  const initialPrompt = prompts.find(p => p.id === currentPromptId);
  if (initialPrompt) {
    displayAssistantMessage(initialPrompt.prompt);
    initialPrompt.options.forEach(option => {
      displayAssistantMessage(`- ${option}`);
    });
  }

})();
