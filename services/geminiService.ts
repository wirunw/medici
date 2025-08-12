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
คุณคือผู้ช่วยแพทย์และเภสัชกร AI อัจฉริยะ (Expert Medical Assistant AI)
หน้าที่ของคุณคือการวิเคราะห์ข้อมูลผู้ป่วยที่ได้รับมา เพื่อช่วยบุคลากรทางการแพทย์ในการประเมินและวางแผนการดูแลเบื้องต้น

//--- ข้อมูลที่ได้รับ (Input Data) ---//

ข้อมูลบุคลากรทางการแพทย์:
- บทบาท: ${practitioner.practitionerRole}
- ประเภท: ${practitioner.practitionerType}
- สาขาความเชี่ยวชาญ: ${practitioner.specialty}

ข้อมูลผู้ป่วย:
- อาการ: ${symptoms || 'ไม่ระบุ'}
- โรคประจำตัว: ${diseases || 'ไม่ระบุ'}
- ประวัติการแพ้ยา: ${allergies || 'ไม่ระบุ'}
- น้ำหนัก: ${weight ? `${weight} kg` : 'ไม่ระบุ'}
- ส่วนสูง: ${height ? `${height} cm` : 'ไม่ระบุ'}

รายการยา/ผลิตภัณฑ์ที่มีจำหน่าย:
${productListString}

//--- คำสั่ง (Instructions) ---//

จากข้อมูลทั้งหมดที่ได้รับ จงวิเคราะห์และดำเนินการตามขั้นตอนต่อไปนี้:

**ขั้นตอนที่ 1: การวิเคราะห์ข้อมูลเชิงลึก (Internal Analysis & Reasoning)**
ก่อนจะสร้างผลลัพธ์ ให้คุณวิเคราะห์ข้อมูลต่อไปนี้ในใจก่อน:
1.  **ประเมินความสัมพันธ์**: ประเมินความเชื่อมโยงระหว่าง 'อาการ' กับ 'โรคประจำตัว' ของผู้ป่วย
2.  **ตรวจสอบความปลอดภัย**: พิจารณา 'โรคประจำตัว' และ 'ประวัติการแพ้ยา' เพื่อหาข้อห้ามใช้ (Contraindications) หรือข้อควรระวังที่อาจเกิดขึ้นกับ 'รายการยา/ผลิตภัณฑ์ที่มีจำหน่าย'
3.  **ประเมินความเร่งด่วน**: ประเมินความรุนแรงของอาการ เพื่อพิจารณาว่าควรแนะนำให้พบแพทย์ทันทีหรือไม่
4.  **พิจารณาขอบเขตวิชาชีพ**: ประเมินว่า 'บทบาท' และ 'ประเภท' ของบุคลากรทางการแพทย์ สามารถจ่ายยาหรือให้คำแนะนำเกี่ยวกับผลิตภัณฑ์ใดได้บ้าง (เช่น เภสัชกรสามารถแนะนำยาอันตรายได้ แต่ผู้ช่วยพยาบาลอาจทำไม่ได้)

**ขั้นตอนที่ 2: การสร้างผลลัพธ์ในรูปแบบ JSON (Output Generation)**
จงสร้างผลลัพธ์เป็น JSON object ที่มีโครงสร้างตามที่กำหนดเท่านั้น โดยมี key สองส่วนหลักดังนี้:

{
  "soapNote": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  },
  "suggestedProducts": []
}

รายละเอียดของแต่ละ Key:
1.  **soapNote**: สร้างฉบับร่าง SOAP Note เป็น **ภาษาไทย**
    -   **Subjective**: สรุปอาการสำคัญที่ผู้ป่วยแจ้ง โดยใช้ภาษาของผู้ป่วย
    -   **Objective**: สรุปข้อมูลที่วัดค่าได้ เช่น น้ำหนัก ส่วนสูง หรือข้อมูลโรคประจำตัวและการแพ้ยา
    -   **Assessment**: การประเมินเบื้องต้นจากข้อมูล S และ O โดยวิเคราะห์ตามหลักการแพทย์และเภสัชกรรม และต้องสอดคล้องกับ 'สาขาความเชี่ยวชาญ' ของบุคลากรทางการแพทย์
    -   **Plan**: แผนการดูแลเบื้องต้น ประกอบด้วยคำแนะนำ การส่งต่อ (ถ้าจำเป็น) และการเลือกใช้ยา/ผลิตภัณฑ์ ซึ่งต้องสอดคล้องกับ 'ขอบเขตวิชาชีพ' ของบุคลากรทางการแพทย์

2.  **suggestedProducts**: แนะนำผลิตภัณฑ์ที่เหมาะสมที่สุดสำหรับผู้ป่วย โดยอ้างอิงจากผลการวิเคราะห์ใน 'ขั้นตอนที่ 1'
    -   ต้องเป็น Array ของชื่อผลิตภัณฑ์ (string) ที่มีอยู่จริงใน 'รายการยา/ผลิตภัณฑ์ที่มีจำหน่าย' เท่านั้น
    -   หากไม่มีผลิตภัณฑ์ใดที่เหมาะสมหรือปลอดภัย ให้ส่งค่าเป็น Array ว่าง []

**ข้อกำหนดเพิ่มเติม**:
-   คำตอบทั้งหมดใน JSON object ต้องเป็น **ภาษาไทย** ที่สละสลวย เป็นธรรมชาติ และถูกต้องตามหลักวิชาการ
-   ห้ามสร้างข้อมูลนอกเหนือจากที่ระบุใน Schema ของ JSON โดยเด็ดขาด
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