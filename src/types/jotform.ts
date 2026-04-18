export interface JotformForm {
  id: string;
  title: string;
  count: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface JotformAnswer {
  text: string;
  answer?: string | string[];
  type: string;
  name: string;
}

export interface JotformSubmission {
  id: string;
  form_id: string;
  ip: string;
  created_at: string;
  status: string;
  answers: Record<string, JotformAnswer>;
}

export interface JotformQuestion {
  qid: string;
  type: string;
  text: string;
  order: string;
  name: string;
}


export interface JotformApiResponse<T> {
  responseCode: number;
  message: string;
  content: T;
  duration: string;
}
