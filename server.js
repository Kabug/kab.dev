const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("./dist/kab-dev"));
app.use(fileUpload());

app.get("/*", (req, res) =>
  res.sendFile("index.html", { root: "dist/kab-dev/" })
);

app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFile = req.files.uploadedFile;
  const filePath = path.join(__dirname, "uploads", uploadedFile.name);

  uploadedFile.mv(filePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.send("File uploaded and saved!");
  });
});

async function fetchDataAndSaveToFile() {
  try {
    console.log("Fetching data");
    // Make a GraphQL request using Axios (replace with your GraphQL endpoint)
    const response = await axios.post(
      "https://beta.pokeapi.co/graphql/v1beta",
      {
        query: `
          query samplePokeAPIquery {
            pokemon_v2_pokemon {
              height
              id
              name
              order
              pokemon_species_id
              weight
              pokemon_v2_pokemonstats {
                base_stat
              }
              pokemon_v2_pokemonsprites {
                id
                sprites
              }
              pokemon_v2_pokemonabilities {
                ability_id
                pokemon_id
                pokemon_v2_ability {
                  name
                }
              }
              pokemon_v2_pokemontypes {
                pokemon_v2_type {
                  name
                }
              }
              pokemon_v2_pokemonspecy {
                pokemon_v2_pokemoncolor {
                  name
                }
                pokemon_v2_generation {
                  id
                  name
                }
                pokemon_v2_pokemonegggroups {
                  pokemon_v2_egggroup {
                    name
                  }
                }
                pokemon_v2_pokemonshape {
                  name
                }
                pokemon_v2_pokemonspeciesflavortexts(
                  where: { language_id: { _eq: 9 } }
                ) {
                  flavor_text
                }
              }
            }
          }
        `,
      }
    );
    // Save the GraphQL response data to a file
    const dataFilePath = path.join(__dirname, "src/assets/data.json");
    await saveDataToFile(dataFilePath, response.data);
    const distFilePath = path.join(__dirname, "dist/kab-dev/assets/data.json");
    await saveDataToFile(distFilePath, response.data);


    console.log("Data fetched from GraphQL and saved successfully.");
  } catch (error) {
    console.error("Error fetching or saving data:", error);
  }
}

app.get("/fetchAndSaveData", async (req, res) => {
  await fetchDataAndSaveToFile();

  res.send("Data fetched from GraphQL and saved successfully.");
});

cron.schedule("0 0 * * *", async () => {
  try {
    // Trigger the /fetchAndSaveData route to fetch and save data
    await fetchDataAndSaveToFile();
    console.log("Data fetched and saved successfully via cron job.");
  } catch (error) {
    console.error("Error triggering data fetch and save via cron job:", error);
  }
});

async function saveDataToFile(filePath, data) {
  const fs = require("fs").promises;

  // Write the data to the file
  await fs.writeFile(filePath, JSON.stringify(data), "utf-8");
}

app.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);

  // Automatically trigger the /fetchAndSaveData route on server startup
  try {
    await fetchDataAndSaveToFile();
    console.log("Data fetched and saved on server startup.");
  } catch (error) {
    console.error("Error triggering data fetch and save on startup:", error);
  }
});
