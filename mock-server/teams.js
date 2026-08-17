// Pool of teams to draw fixtures from. Not exhaustive, just enough variety
// for local development against a realistic-looking dataset.
const TEAM_POOL = [
  { name: "Manchester United", shortName: "MUN" },
  { name: "Liverpool", shortName: "LIV" },
  { name: "Arsenal", shortName: "ARS" },
  { name: "Chelsea", shortName: "CHE" },
  { name: "Manchester City", shortName: "MCI" },
  { name: "Tottenham Hotspur", shortName: "TOT" },
  { name: "Real Madrid", shortName: "RMA" },
  { name: "Barcelona", shortName: "BAR" },
  { name: "Bayern Munich", shortName: "BAY" },
  { name: "Paris Saint-Germain", shortName: "PSG" },
  { name: "Inter Milan", shortName: "INT" },
  { name: "AC Milan", shortName: "ACM" },
];

const PLAYER_POOL = [
  "Marcus Rashford",
  "Bruno Fernandes",
  "Mohamed Salah",
  "Virgil van Dijk",
  "Bukayo Saka",
  "Martin Ødegaard",
  "Cole Palmer",
  "Erling Haaland",
  "Kevin De Bruyne",
  "Son Heung-min",
  "Jude Bellingham",
  "Vinícius Júnior",
  "Robert Lewandowski",
  "Kylian Mbappé",
  "Lautaro Martínez",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function drawFixture(usedNames) {
  const available = TEAM_POOL.filter((t) => !usedNames.has(t.name));
  const pool = available.length >= 2 ? available : TEAM_POOL;
  const home = randomFrom(pool);
  let away = randomFrom(pool);
  while (away.name === home.name) away = randomFrom(pool);
  return [home, away];
}

module.exports = { TEAM_POOL, PLAYER_POOL, randomFrom, drawFixture };
