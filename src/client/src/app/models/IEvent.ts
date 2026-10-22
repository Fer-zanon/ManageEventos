export interface IEvent {
  id: string;
  theme: string;
  contactName: string;
  phone: string;
  contactId: string | null;
  date: string;
  time: string;
  deposit: number | null;
  amount: number | null;
  location: string;
  notes: string;
  photos?: string[];
}

export interface IContact {
  id: string;
  name: string;
  phone: string;
}
