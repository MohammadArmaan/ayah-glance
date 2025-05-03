export function startSpeechRecognition(onResultCallback, setIsListening) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
  
    recognition.onstart = () => {
      setIsListening(true);
    };
  
    recognition.onend = () => {
      setIsListening(false);
    };
  
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResultCallback(transcript);
    };
  
    recognition.start();
  }