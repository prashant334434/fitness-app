export type Profile = {
  gender?: string;
  age: number;
  weight: string;
  target: string;
  height: string;
  goal: string;
  days: string;
};

export type Stack = {
  Welcome: undefined;
  Onboarding: undefined;
  Personalizing: { profile: Profile };
  Home: { profile?: Profile } | undefined;
  Gyms: undefined;
  Play: undefined;
  Events: undefined;
  EventDetails: { id: string };
  Booking: { kind: 'gym' | 'court' | 'event'; id: string };
};
