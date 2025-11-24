
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Estate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define tools
const navigateTool: FunctionDeclaration = {
  name: "navigate_app",
  description: "Navigate the user to a specific part of the application.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: {
        type: Type.STRING,
        description: "The destination. Use 'DASHBOARD' for the main view, 'PROFILE' for user profile, or the exact name of an estate.",
      },
    },
    required: ["destination"],
  },
};

const reportTool: FunctionDeclaration = {
  name: "generate_report",
  description: "Generate a printable PDF report.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      target: {
        type: Type.STRING,
        description: "The target for the report. Use 'CURRENT' for the active page.",
      },
    },
    required: ["target"],
  },
};

const draftTenantTool: FunctionDeclaration = {
  name: "draft_tenant",
  description: "Draft a new tenant form with extracted data from text or files.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      email: { type: Type.STRING },
      phoneNumber: { type: Type.STRING },
      flatType: { type: Type.STRING },
      rentExpected: { type: Type.NUMBER },
      rentPaid: { type: Type.NUMBER },
      rentStartDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
      rentDueDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
      phase: { type: Type.STRING },
      block: { type: Type.STRING }
    },
    required: ["name"],
  },
};

export interface AppActions {
  navigate: (destination: string) => void;
  generateReport: (target: string) => void;
  openAddTenant: (data: any) => void;
}

export class ChatService {
  private chat: any;

  constructor(estates: Estate[]) {
    const estateNames = estates.map(e => e.name).join(", ");
    const systemInstruction = `
      You are the Gabinas Assistant, a helpful AI for the Gabinas Properties Monitor app.
      
      Your goal is to help users navigate, get information, and process documents.
      Available Estates: ${estateNames}.
      
      Capabilities:
      1. Navigate: If a user wants to go to a specific estate, dashboard, or profile, use 'navigate_app'.
      2. Reports: If a user asks for a report, use 'generate_report'.
      3. Data Entry: If a user uploads a document or provides text with tenant details and asks to add/populate/draft a tenant, extract the info and use 'draft_tenant'.
         - Convert dates to YYYY-MM-DD.
         - Infer '1 Bedroom', '2 Bedroom Basic', '2 Bedroom Maxi' from text if possible.
         - Infer 'Phase 1' through 'Phase 5' for Maben Flats if mentioned.
      4. General Q&A: Answer questions about the app or real estate management politely.
      
      Tone: Professional, efficient, and friendly.
      Always acknowledge the user's request. If you execute a tool, briefly confirm what you did.
    `;

    this.chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [navigateTool, reportTool, draftTenantTool] }],
      },
    });
  }

  async sendMessage(text: string, actions: AppActions): Promise<string> {
    let delay = 1000; // Start with 1 second delay

    // Infinite loop until success as requested, BUT break on specific errors
    while (true) {
      try {
        let response = await this.chat.sendMessage({ message: text });
        
        // Handle Tool Calls (Function Calls)
        const toolCalls = response.functionCalls;
        
        if (toolCalls && toolCalls.length > 0) {
          const toolResponses = [];
          
          for (const call of toolCalls) {
            let result = "Success";
            
            try {
              if (call.name === "navigate_app") {
                const dest = call.args.destination as string;
                actions.navigate(dest);
                result = `Navigated to ${dest}`;
              } else if (call.name === "generate_report") {
                const target = call.args.target as string;
                actions.generateReport(target);
                result = `Generated report for ${target}`;
              } else if (call.name === "draft_tenant") {
                actions.openAddTenant(call.args);
                result = "Opened add tenant modal with drafted data.";
              }
            } catch (e) {
              result = "Failed to execute action";
            }

            toolResponses.push({
              id: call.id,
              name: call.name,
              response: { result: result }
            });
          }

          // Send execution results back to the model
          response = await this.chat.sendMessage({ 
             parts: toolResponses.map(tr => ({
               functionResponse: tr
             }))
          });
        }

        return response.text || "I've processed that request.";
      } catch (error: any) {
        const errorString = error.toString().toLowerCase();

        // Check for Quota Exhaustion / Rate Limiting
        if (errorString.includes("429") || errorString.includes("exhausted") || errorString.includes("quota")) {
          return "I've reached my daily thinking limit! 🧠✨ I'm currently recharging to give you the best possible assistance. Please check back tomorrow, and I'll be ready to help you manage your properties again. In the meantime, all other features of the app are fully functional.";
        }

        console.warn("Gemini API Connection Error. Retrying in " + delay + "ms...", error);
        
        // Calculate delay with exponential backoff (max 10 seconds)
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 10000);
        
        // Loop continues automatically for non-fatal errors
      }
    }
  }
}
