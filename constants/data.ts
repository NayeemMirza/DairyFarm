import icons from "./icons";
import images from "./images";

export const cards = [
  {
    title: "Card 1",
    location: "Location 1",
    price: "$100",
    rating: 4.8,
    category: "house",
    image: images.newYork,
  },
  {
    title: "Card 2",
    location: "Location 2",
    price: "$200",
    rating: 3,
    category: "house",
    image: images.japan,
  },
  {
    title: "Card 3",
    location: "Location 3",
    price: "$300",
    rating: 2,
    category: "flat",
    image: images.newYork,
  },
  {
    title: "Card 4",
    location: "Location 4",
    price: "$400",
    rating: 5,
    category: "villa",
    image: images.japan,
  },
];

export const featuredCards = [
  {
    title: "Featured 1",
    location: "Location 1",
    price: "$100",
    rating: 4.8,
    image: images.newYork,
    category: "house",
  },
  {
    title: "Featured 2",
    location: "Location 2",
    price: "$200",
    rating: 3,
    image: images.japan,
    category: "flat",
  },
];

export const categories = [
  { title: "All", category: "All" },
  { title: "Cows", category: "Cows" },
  { title: "Buffaloes", category: "Buffaloes" },
  { title: "Goats", category: "Goats" },
  { title: "Calves", category: "Calves" },
  { title: "Pregnant Animals", category: "Pregnant" },
  { title: "Dry Animals", category: "Dry" },

  // Milk production levels
  { title: "High Milk Yield", category: "HighMilk" },
  { title: "Medium Milk Yield", category: "MediumMilk" },
  { title: "Low Milk Yield", category: "LowMilk" },

  // Breed types (examples)
  { title: "Holstein Friesian", category: "HolsteinFriesian" },
  { title: "Jersey", category: "Jersey" },
  { title: "Sahiwal", category: "Sahiwal" },
  { title: "Murrah Buffalo", category: "MurrahBuffalo" },
  { title: "Mix Cow", category: "MixCow" },

  { title: "Others", category: "Others" },
];

export const settings = [
  {
    title: "My Bookings",
    icon: icons.calendar,
  },
  {
    title: "Payments",
    icon: icons.wallet,
  },
  {
    title: "Profile",
    icon: icons.person,
  },
  {
    title: "Notifications",
    icon: icons.bell,
  },
  {
    title: "Security",
    icon: icons.shield,
  },
  {
    title: "Language",
    icon: icons.language,
  },
  {
    title: "Help Center",
    icon: icons.info,
  },
  {
    title: "Invite Friends",
    icon: icons.people,
  },
];

export const facilities = [
  {
    title: "Laundry",
    icon: icons.laundry,
  },
  {
    title: "Car Parking",
    icon: icons.carPark,
  },
  {
    title: "Sports Center",
    icon: icons.run,
  },
  {
    title: "Cutlery",
    icon: icons.cutlery,
  },
  {
    title: "Gym",
    icon: icons.dumBell,
  },
  {
    title: "Swimming pool",
    icon: icons.swim,
  },
  {
    title: "Wifi",
    icon: icons.wifi,
  },
  {
    title: "Pet Center",
    icon: icons.dog,
  },
];

export const gallery = [
  {
    id: 1,
    image: images.newYork,
  },
  {
    id: 2,
    image: images.japan,
  },
  {
    id: 3,
    image: images.newYork,
  },
  {
    id: 4,
    image: images.japan,
  },
  {
    id: 5,
    image: images.newYork,
  },
  {
    id: 6,
    image: images.japan,
  },
];

export const animalTypeList = [
  {name: 'Cow', value: 'Cow'},
  {name: 'Buffalo', value: 'Buffalo'},
];


export const calvingList = [
  {name: '1st', value: '1'},
  {name: '2nd', value: '2'},
  {name: '3rd', value: '3'},
  {name: '4th', value: '4'},
];

export const calfGenderList = [
  {name: 'Female Calf', value: 'female'},
  {name: 'Male Calf', value: 'male'},
];