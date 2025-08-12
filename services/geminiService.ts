import { GoogleGenAI, Type } from "@google/genai";
import type { PreliminaryInfo, Product, Practitioner } from '../types';

// --- นี่คือบรรทัดที่ถูกแก้ไข ---
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    soapNote: {
      type: Type.STRING,
      description: "A comprehensive SOAP note based on the patient's information. It must have four sections: S (Subjective), O (Objective), A (Assessment), and P (Plan). The 'P' section should include lifestyle advice and reference potential products."
    },
    suggestedProducts: {
      type: Type.ARRAY,
      description: "An array of product names from the provided list that are relevant to the patient's symptoms. Only include exact names from the list. Do not suggest products if there are contraindications (like allergies).",
      items: {
        type: Type.STRING
      }
    }
  },
  required: ["soapNote", "suggestedProducts"]
};

export const generatePractitionerDraft = async (
  preliminaryInfo: PreliminaryInfo,
  practitioner: Practitioner,
  productList: Product[]
): Promise<{ soapNote: string; suggestedProducts: string[] } | null> => {
  const { symptoms, diseases, allergies, weight, height } = preliminaryInfo;

  const productListString = productList.map(p => `- ${p.name}: ${p.description} (Category: ${p.category})`).join('\n');

  const prompt = `
    You are an expert medical assistant AI. Your task is to analyze patient information for a healthcare practitioner.

    Practitioner Information:
    - Role: ${practitioner.practitionerRole}
    - Type: ${practitioner.practitionerType}
    - Specialty: ${practitioner.specialty}

    Patient Information:
    - Symptoms: ${symptoms || 'Not provided'}
    - Chronic Diseases: ${diseases || 'Not provided'}
    - Drug Allergies: ${allergies || 'Not provided'}
    - Weight: ${weight ? `${weight} kg` : 'Not provided'}
    - Height: ${height ? `${height} cm` : 'Not provided'}

    Available Products/Medications:
    ${productListString}

    Based on all the information provided, perform the following two tasks and return the result in a single, valid JSON object:

    1.  **Generate a SOAP Note**: Create a draft SOAP (Subjective, Objective, Assessment, Plan) note. Tailor the assessment and plan to the practitioner's role and specialty.
    2.  **Suggest Products**: From the "Available Products/Medications" list, suggest relevant items for the patient. Consider the practitioner's scope of practice (e.g., a nurse or independent practitioner may not prescribe dangerous drugs). Return an array of the exact product names.

    Your response MUST be a JSON object that strictly adheres to the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      }
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed && typeof parsed.soapNote === 'string' && Array.isArray(parsed.suggestedProducts)) {
      return parsed;
    }
    
    console.error("Parsed JSON does not match expected format:", parsed);
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate practitioner draft from AI.");
  }
};


export const summarizeSoapNoteForPatient = async (soapNote: string): Promise<string> => {
  const prompt = `
    You are a friendly and helpful healthcare professional. Your task is to rewrite a technical SOAP note into a simple, clear, and easy-to-understand summary for a patient. 
    The language must be Thai.
    Do not use the terms "S:", "O:", "A:", or "P:". 
    Combine the information into a single, cohesive paragraph of advice. 
    Focus on the key symptoms, the assessment, and the recommended plan, including medication/product instructions and when to see a doctor if symptoms don't improve.

    Here is the SOAP note:
    ---
    ${soapNote}
    ---

    Please provide the patient-friendly summary in Thai.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Error calling Gemini API for summarization:", error);
    return `เกิดข้อผิดพลาดในการสรุปคำแนะนำ\n\n${soapNote}`;
  }
};