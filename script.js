// ==================== ELEMENTOS DEL DOM ====================
const chatBtn = document.getElementById('chatBtn');
const chatWidget = document.getElementById('chatWidget');
const closeChat = document.getElementById('closeChat');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const themeToggle = document.getElementById('themeToggle');

// ==================== CONFIGURACIÓN AZURE ====================
const endpoint = "https://rodirx.cognitiveservices.azure.com/language/:query-knowledgebases?projectName=rodrix&api-version=2021-10-01&deploymentName=production";
const apiKey = "66aUQunUxlj1dcJ7wM6ioUEZNvfO52EXhyb2XUULjWMqiqpi9vvTJQQJ99BKACZoyfiXJ3w3AAAaACOGLxkb"; // ⚠️ Solo pruebas

// ==================== CHATBOT ====================
// Abrir/cerrar widget
chatBtn.addEventListener('click', () => chatWidget.classList.toggle('open'));
closeChat.addEventListener('click', () => chatWidget.classList.remove('open'));

// Enviar mensaje con click o Enter
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());

// ==================== FUNCION PRINCIPAL ====================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  userInput.value = '';
  userInput.disabled = true;

  // Mostrar "escribiendo..."
  const typingMsg = appendMessage("⏳ escribiendo...", "ai");

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        top: 3,
        question: text,
        includeUnstructuredSources: true,
        confidenceScoreThreshold: 0.2,
        answerSpanRequest: {
          enable: true,
          topAnswersWithSpan: 1,
          confidenceScoreThreshold: 0.2
        }
      })
    });

    const data = await response.json();
    console.log('Azure response:', data);

    // Extraer respuesta
    const answer = data.answers?.[0]?.answer || "Lo siento, no tengo una respuesta para eso.";
    typingMsg.querySelector('.bubble').textContent = answer;

  } catch (error) {
    console.error(error);
    typingMsg.querySelector('.bubble').textContent = "⚠️ Error al conectar con el servicio de Azure.";
  } finally {
    userInput.disabled = false;
    userInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ==================== FUNCIONES AUXILIARES ====================
function appendMessage(message, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('msg', sender);
  msgDiv.innerHTML = `<div class="bubble">${message}</div>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgDiv; // Devuelve el div para actualizar "typing..."
}

// ==================== MODO DÍA/NOCHE ====================
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Cargar tema guardado al iniciar
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
});

themeToggle.addEventListener('click', toggleTheme);
