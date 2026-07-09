const db = require("./db");

const products = [
  { title: "Midnight Static", artist: "Coral Loom", category: "Electronic", price: 28.5, stock: 14, year: "2023", format: "12\" LP", color_a: "#C1622D", color_b: "#1B1815", featured: 1,
    description: "A slow-burning electronic record built from tape hiss, analog synth pads, and a single looping bassline that never quite resolves. Pressed on 180g charcoal vinyl." },
  { title: "Low Tide Sessions", artist: "Marrow & Salt", category: "Jazz", price: 32, stock: 9, year: "2021", format: "12\" LP", color_a: "#6B7156", color_b: "#0F0D0B", featured: 1,
    description: "Recorded live in a single room with the windows open. Upright bass, brushed drums, and a trumpet that sounds like it's thinking out loud." },
  { title: "Field Recordings Vol. II", artist: "Otis Vane", category: "Ambient", price: 24, stock: 20, year: "2022", format: "12\" LP", color_a: "#D4A24C", color_b: "#1B1815",
    description: "Manipulated recordings of rainfall, subway platforms, and old radiators, arranged into something closer to a lullaby than a soundscape." },
  { title: "Copperline", artist: "The Quiet Machines", category: "Rock", price: 26, stock: 11, year: "2020", format: "12\" LP", color_a: "#C1622D", color_b: "#6B7156", featured: 1,
    description: "Four musicians who have played together for a decade, finally letting a song run long enough to breathe. Guitar-forward and unhurried." },
  { title: "Paper Moon Waltz", artist: "Sable & Rue", category: "Folk", price: 22, stock: 16, year: "2019", format: "12\" LP", color_a: "#D4A24C", color_b: "#6B7156",
    description: "Two voices, one guitar, and a room with good wood floors. Recorded to tape in an afternoon and left almost entirely alone in the mix." },
  { title: "Voltage Garden", artist: "Nine Volt Choir", category: "Electronic", price: 30, stock: 7, year: "2023", format: "2x12\" LP", color_a: "#1B1815", color_b: "#C1622D",
    description: "A double LP of modular synth pieces, each one grown from a single patch and left to evolve for exactly one side of vinyl." },
  { title: "Harbor Lights", artist: "Marrow & Salt", category: "Jazz", price: 29, stock: 12, year: "2018", format: "12\" LP", color_a: "#0F0D0B", color_b: "#D4A24C",
    description: "The quartet's debut. Loose, late-night, and unafraid of silence. Best played after midnight with the lights down low." },
  { title: "Terracotta Radio", artist: "Otis Vane", category: "Ambient", price: 25, stock: 18, year: "2024", format: "12\" LP", color_a: "#C1622D", color_b: "#D4A24C",
    description: "Warm drones built around a single detuned shortwave signal, layered until the static starts to sound like a choir." },
  { title: "Concrete Bloom", artist: "The Quiet Machines", category: "Rock", price: 27, stock: 10, year: "2022", format: "12\" LP", color_a: "#6B7156", color_b: "#D4A24C",
    description: "Their heaviest record, tracked live off the floor in three days. Six songs, no overdubs, and a closing track that runs nine minutes." },
  { title: "Ash & Amber", artist: "Sable & Rue", category: "Folk", price: 23, stock: 15, year: "2023", format: "12\" LP", color_a: "#1B1815", color_b: "#6B7156",
    description: "A quieter follow-up written mostly on a porch. Songs about leaving places and the things you decide to bring with you." },
  { title: "The Belmont 3 Turntable", artist: "Belmont Audio", category: "Gear", price: 349, stock: 5, year: "2024", format: "Turntable", color_a: "#0F0D0B", color_b: "#C1622D",
    description: "A belt-drive turntable with a solid walnut plinth, built-in preamp, and a tonearm light enough to treat your records the way they deserve." },
  { title: "Fireside Phono Preamp", artist: "Belmont Audio", category: "Gear", price: 129, stock: 8, year: "2023", format: "Preamp", color_a: "#C1622D", color_b: "#0F0D0B",
    description: "A compact preamp for anyone still running their turntable straight into a receiver. Warms things up without smoothing them over." },
];

const insert = db.prepare(`
  INSERT INTO products (title, artist, category, price, stock, description, color_a, color_b, year, format, featured)
  VALUES (@title, @artist, @category, @price, @stock, @description, @color_a, @color_b, @year, @format, @featured)
`);

const existing = db.prepare("SELECT COUNT(*) AS c FROM products").get();
if (existing.c === 0) {
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run({ featured: 0, ...row });
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log(`Products table already has ${existing.c} rows, skipping seed.`);
}
