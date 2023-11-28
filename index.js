const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const main = async () => {
  try {
    const directoryPath = process.argv[2];
    if (!directoryPath) {
      console.error('Please provide the directory path as a CLI argument.');
      return;
    }

    // Create the output directory if it doesn't exist
    const outputDirectory = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    // Read all JSON files from the specified directory
    const fileNames = await readdir(directoryPath);
    const allTagsMap = new Map();

    // Regex pattern to match opening HTML tags
    const tagPattern = /<(\w+)/g;

    // Process each JSON file
    for (const fileName of fileNames) {
      if (path.extname(fileName) === '.json') {
        const filePath = path.join(directoryPath, fileName);
        const jsonData = await readFile(filePath, 'utf8');

        for (const obj of JSON.parse(jsonData)?.products) {
          // extract unique HTML tags
          let match;
          while ((match = tagPattern.exec(obj.body_html)) !== null) {
            const tag = match[1].toLowerCase();
            allTagsMap.set(tag, true);
          }
        }
      }
    }

    const uniqueTagsArray = Array.from(allTagsMap.keys()).sort();
  
    const csv = uniqueTagsArray.join(',');
    const outputFile = path.join(outputDirectory, 'unique_tags.csv');
    await writeFile(outputFile, csv);

    console.log(`CSV file written to: ${outputFile}`);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

main();
