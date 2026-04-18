import { JotformApiResponse, JotformForm, JotformSubmission, JotformQuestion } from '@/types/jotform';

const API_KEY = process.env.NEXT_PUBLIC_JOTFORM_API_KEY;
const BASE_URL = 'https://api.jotform.com';

export const jotformService = {
  async getForm(formId: string): Promise<JotformForm> {
    const response = await fetch(`${BASE_URL}/form/${formId}?apiKey=${API_KEY}`);
    const data: JotformApiResponse<JotformForm> = await response.json();
    if (data.responseCode !== 200) throw new Error(data.message);
    return data.content;
  },

  async getFormSubmissions(formId: string): Promise<JotformSubmission[]> {
    const response = await fetch(`${BASE_URL}/form/${formId}/submissions?apiKey=${API_KEY}`);
    const data: JotformApiResponse<JotformSubmission[]> = await response.json();
    if (data.responseCode !== 200) throw new Error(data.message);
    return data.content;
  },

  async getFormQuestions(formId: string): Promise<Record<string, JotformQuestion>> {
    const response = await fetch(`${BASE_URL}/form/${formId}/questions?apiKey=${API_KEY}`);
    const data: JotformApiResponse<Record<string, JotformQuestion>> = await response.json();
    if (data.responseCode !== 200) throw new Error(data.message);
    return data.content;
  },

  async getAllFormsData(formIds: string[]) {
    const forms = await Promise.all(
      formIds.map(async (id) => {
        try {
          const [form, submissions, questions] = await Promise.all([
            this.getForm(id),
            this.getFormSubmissions(id),
            this.getFormQuestions(id),
          ]);
          return { form, submissions, questions };
        } catch (error) {
          console.error(`Error fetching form ${id}:`, error);
          return null;
        }
      })
    );
    return forms.filter(Boolean);
  },
};
