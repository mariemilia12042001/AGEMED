import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini API client gracefully
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AGEMED API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
} else {
  console.log("Gemini API key is not set. Chat assistant will run in rich local fallback / simulated mode.");
}

// AGEMED API chat route
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "El cuerpo de la petición debe contener una lista 'messages'." });
  }

  // Fallback to local expert simulated responses if Gemini client is not initialized or key is missing
  if (!ai) {
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    const lowerMsg = lastUserMessage.toLowerCase();
    
    let answer = "Hola. Soy tu Asistente de Salud AGEMED. ¿En qué puedo ayudarte hoy?";
    
    if (lowerMsg.includes("cita") && (lowerMsg.includes("dónde") || lowerMsg.includes("donde"))) {
      answer = "Tu cita es mañana, 14 de Octubre a las 10:30 AM en la especialidad de Cardiología Preventiva. El Dr. Alejandro Valdivia te atenderá en la Clínica San Lucas, Torre Médica, Piso 4, Consultorio 402.";
    } else if (lowerMsg.includes("llevar") || lowerMsg.includes("preparar") || lowerMsg.includes("requisito") || lowerMsg.includes("indicacion") || lowerMsg.includes("indicación")) {
      answer = "Para tu cita de mañana debes tomar en cuenta las siguientes indicaciones:\n1. Mantener un ayuno absoluto de 8 horas.\n2. Traer tu historial médico previo impreso o en formato digital.\n3. Acercarte al establecimiento de salud 15 minutos antes de la hora acordada (10:15 AM) para el triaje.";
    } else if (lowerMsg.includes("reagendar") || lowerMsg.includes("cambiar") || lowerMsg.includes("cancelar")) {
      answer = "Puedes reagendar o cancelar tus citas actuales y pendientes desde la pestaña 'Citas' en la barra de navegación del aplicativo o poniéndote en contacto con nuestra central telefónica EsSalud.";
    } else if (lowerMsg.includes("receta") || lowerMsg.includes("medicamento") || lowerMsg.includes("pastilla") || lowerMsg.includes("prescripcion") || lowerMsg.includes("prescripción")) {
      answer = "Puedes consultar todas tus recetas médicas actuales directamente en la sección 'Historial' del menú. De igual manera, he activado tus recordatorios automatizados de medicamento de Paracetamol y Atorvastatina.";
    } else if (lowerMsg.includes("ayuno") || lowerMsg.includes("comida") || lowerMsg.includes("comer")) {
      answer = "Sí, es de suma importancia estar en ayuno para que los exámenes cardiológicos de laboratorio tengan un resultado preciso. Recuerda no ingerir alimentos pesados ni bebidas con cafeína hoy por la noche.";
    } else if (lowerMsg.trim().length > 0) {
      answer = `[Asistente Médico] He recibido tu consulta: "${lastUserMessage}". Como tu Asistente AGEMED, te recomiendo descansar, mantener una dieta balanceada en sodio, y acudir puntualmente a tu cita de mañana con el Dr. Alejandro Valdivia a las 10:30 AM. Si presentas dolor agudo de pecho o dificultad respiratoria grave, por favor acude de inmediato a emergencias de EsSalud.`;
    }
    
    return res.json({ text: answer, simulated: true });
  }

  try {
    // Format messages for @google/genai SDK format
    // Each past message needs to correspond to either 'user' or 'model' roles.
    const contents = messages.map(m => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `Eres el "Asistente AGEMED" (el chatbot médico interactivo oficial de EsSalud). 
Tu misión es aconsejar y ayudar amablemente y de forma empática a la paciente Elena Martínez con respecto a:
- Detalles de su próxima cita de Cardiología Preventiva con el Dr. Alejandro Valdivia (Mañana, 14 de Octubre a las 10:30 AM en la Clínica San Lucas, Piso 4, Consultorio 402).
- Sus requerimientos de preparación antes de la cita (Ayuno de 8 horas, traer historial previo, llegar 15 minutos antes).
- Sus medicamentos recomendados (Paracetamol cada 8 horas, Atorvastatina cada 24 horas antes de dormir para control del colesterol).
- Guías de salud, como caminar 20 minutos diarios para cuidar su corazón.
- Uso general del app (pestañas Citas, Historial Médico, Perfil, etc.).

NORMAS CLAVE:
1. Sé increíblemente atento, cálido, profesional y educado en español.
2. Haz referencias de cariño y cordialidad como "Estimada Sra. Elena" o "Sra. Martínez".
3. NO des diagnósticos definitivos graves de forma irresponsable. En caso de dudas graves sobre dolor torácico, dile que acuda a emergencias o llame de inmediato a un médico especialista.
4. Mantén tus respuestas claras, estructuradas con viñetas amigables y concisas para que se lean de forma óptima en una pantalla de celular.`,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Disculpe, no he podido procesar la respuesta. ¿Podría repetirme la consulta, Sra. Elena?";
    return res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini system generation error:", error);
    return res.status(500).json({ error: "Error interno al comunicarse con el asistente de inteligencia artificial." });
  }
});

// Configure Vite or Serve Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AGEMED server running on port ${PORT}`);
  });
}

startServer();
