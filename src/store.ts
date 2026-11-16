export const store = {
  brand: "THICK.",
  company: "THICK Holdings LLC",
  street: "1073 Wisconsin Ave NW",
  unit: "1st Floor",
  city: "Washington, DC 20007",
  phone: "(771) 253-9358",
  phoneHref: "tel:+17712539358",
  hours: {
    days: "Every day",
    opens: "11:30",
    closes: "22:00",
    opensLabel: "11:30 AM",
    closesLabel: "10:00 PM",
  },
  softOpening: {
    through: "Nov 20",
    opens: "11:30",
    closes: "20:00",
    label: "11:30 AM – 8:00 PM",
  },
};

export const storeDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${store.street}, ${store.unit}, ${store.city}`,
)}`;
