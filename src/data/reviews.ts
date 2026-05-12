export type Review = {
  id: string;
  name: string;
  rating: number;
  body: string;
  city: string;
};

export const reviews: Review[] = [
  { id: "r1", name: "Jasmine T.", rating: 5, city: "Birmingham, AL", body: "Best donuts in Alabama, hands down. The maple bacon bar is unreal." },
  { id: "r2", name: "Marcus B.", rating: 5, city: "Huntsville, AL", body: "I drive 20 min out of my way for the kolaches. Worth every minute." },
  { id: "r3", name: "Lacey K.", rating: 5, city: "Auburn, AL", body: "Family-owned and you can tell. Staff remembers my order. Coffee is dialed." },
  { id: "r4", name: "Devon R.", rating: 4, city: "Mobile, AL", body: "Original glazed melts in your mouth. Pickup through the app is fast." },
  { id: "r5", name: "Priya S.", rating: 5, city: "Tuscaloosa, AL", body: "Strawberry frosted is the move. Brought a dozen to the office, gone in 10 min." },
  { id: "r6", name: "Caleb M.", rating: 5, city: "Montgomery, AL", body: "Cold brew slaps. Breakfast sandwich on the croissant is my new ritual." },
];
