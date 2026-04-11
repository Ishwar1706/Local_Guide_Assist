export const MOCK_GUIDES = [
  {
    id: 1,
    name: "Elena Rodriguez",
    location: "Barcelona, Spain",
    bio: "Art historian and food enthusiast born and raised in Barcelona. I love showing hidden gems of the Gothic Quarter.",
    rating: 4.9,
    reviews: 124,
    price: 45,
    languages: ["English", "Spanish", "Catalan"],
    avatar: "https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random"
  },
  {
    id: 2,
    name: "Kenji Sato",
    location: "Tokyo, Japan",
    bio: "Photographer and local guide. I'll take you to the best spots for street photography and local izakayas.",
    rating: 5.0,
    reviews: 89,
    price: 60,
    languages: ["English", "Japanese"],
    avatar: "https://ui-avatars.com/api/?name=Kenji+Sato&background=random"
  },
  {
    id: 3,
    name: "Sarah Miller",
    location: "New York, USA",
    bio: "NYC local for 10 years. Specialized in Broadway history and Brooklyn culinary tours.",
    rating: 4.8,
    reviews: 210,
    price: 55,
    languages: ["English", "French"],
    avatar: "https://ui-avatars.com/api/?name=Sarah+Miller&background=random"
  }
];

export const MOCK_BOOKINGS = [
  {
    id: 101,
    tourist: { name: "Alice Smith", id: 501 },
    guide: { name: "Elena Rodriguez", id: 1 },
    date: "2024-05-15",
    time: "10:00 AM",
    duration: 3,
    location: "Gothic Quarter, Barcelona",
    price: 135,
    status: "Confirmed"
  },
  {
    id: 102,
    tourist: { name: "John Doe", id: 502 },
    guide: { name: "Kenji Sato", id: 2 },
    date: "2024-05-20",
    time: "06:00 PM",
    duration: 4,
    location: "Shinjuku, Tokyo",
    price: 240,
    status: "Pending"
  }
];
