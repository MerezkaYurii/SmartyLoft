export interface HeroData {
  title: string;
  subtitle: string;
  cta: string;
}

export interface ContactsData {
  telegram?: string;
  viber?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}
export interface AboutData {
  title: string;
  text: string;
}

export interface Service {
  id?: number;
  image: string;
  price: string;
  title: string;
  specification: string;
  desc: string;
}

export interface Portfolio {
  title: string;
  subtitle: string;
  projects: string[];
}

export interface ContactData {
  title: string;
  desc: string;
  phone: string;
  email: string;
  address?: string;
  button: string;
}

export interface SiteData {
  siteTitle: string;
  contacts: ContactsData;
  hero: HeroData;
  about: AboutData;
  services: Service[];
  contact: ContactData;
}
