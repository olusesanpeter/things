export type ThingStatus = "like" | "have" | "want";

export interface Thing {
  id: string;
  title: string;
  status: ThingStatus;
  description?: string;
  image?: string;
  link?: string;
}

