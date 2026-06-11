require("dotenv").config();
const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/orb-ping", async ({ ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/orb-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/orb-ping - Check bot latency
/orb-catfact - Get a cat fact
/orb-joke - Get a joke
/orb-apod - NASA Astronomy Picture of the Day
/orb-iss - Current location of the ISS
/orb-astronauts - Who is in space right now`
  });
});

app.command("/orb-catfact", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/orb-joke", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text: `${response.data.setup}\n\n${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/orb-apod", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
    const { title, date, explanation, url } = response.data;
    await respond({
      text: `NASA Astronomy Picture of the Day\n*${title}* (${date})\n${explanation}\n${url}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch NASA picture of the day." });
  }
});

app.command("/orb-iss", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("http://api.open-notify.org/iss-now.json");
    const { latitude, longitude } = response.data.iss_position;
    await respond({
      text: `ISS Current Location:\nLatitude: ${latitude}\nLongitude: ${longitude}\nhttps://www.google.com/maps?q=${latitude},${longitude}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch ISS location." });
  }
});

app.command("/orb-astronauts", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("http://api.open-notify.org/astros.json");
    const people = response.data.people;
    const list = people.map(p => `• ${p.name} (${p.craft})`).join("\n");
    await respond({
      text: `There are ${response.data.number} people in space right now:\n${list}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch astronaut data." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();