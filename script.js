import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import sgMail from "@sendgrid/mail";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendEmailNotification(
  incomingSubject,
  incomingText,
  incomingHTML
) {
  sgMail.setApiKey(process.env.MAIL_SERVER_API_KEY);
  const msg = {
    to: process.env.RECEIVER_EMAIL, // recipient
    from: process.env.SENDER_EMAIL, // verified sender
    subject: incomingSubject,
    text: incomingText,
    html: incomingHTML,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

//logging
const logFilePath = __dirname + "/app.log";

function log(message) {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error appending to log file:", err);
    }
  });
}
// Function to run the script
async function runScript() {
  console.log("script started");

  const options = new chrome.Options();
  options.addArguments("--headless");
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  console.log("driver started");

  try {
    await driver.get("https://www.psoas.fi/en/apartments");

    const parentLiElement = await driver.findElement(
      By.className("sf-field-post-meta-htyyppi")
    );

    const ulElement = await parentLiElement.findElement(By.tagName("ul"));

    // Find all <li> elements within the <ul> element
    const liElements = await ulElement.findElements(By.tagName("li"));

    // Click on the 3rd <li> item (index 2, as it is 0-based)
    // Here [0] = Shared Apartments, [1]=family apartments, [2]=studio apartments
    await liElements[2].click();

    await driver.sleep(4000); // Wait for 2 seconds

    // Find the <select> element by name
    const selectElement = await driver.findElement(
      By.name("_sfm_huoneistojen_tilanne[]")
    );

    // Select the second option by index (index 1, as it is 0-based)
    await selectElement.findElement(By.css("option:nth-child(2)")).click();

    // Get the selected option's "data-sf-count" attribute value
    const selectedOptionElement = await selectElement.findElement(
      By.css("option:checked")
    );
    const dataSfCount = await selectedOptionElement.getAttribute(
      "data-sf-count"
    );

    if (dataSfCount > 0) {
      log(`${dataSfCount} of Studio apartments available`);

      let APARTMENT_SUBJECT = "Studio Apartment Available Now";
      let APARTMENT_TEXT = `Right now there are ${dataSfCount} apartmenst available`;
      let APARTMENT_HTML = `<strong>Right now there are ${dataSfCount} apartments available</strong>`;
      // send the email if vacant
      await sendEmailNotification(
        APARTMENT_SUBJECT,
        APARTMENT_TEXT,
        APARTMENT_HTML
      );
    } else {
      log(`No Studio apartments available`);
    }
  } catch (error) {
    console.log("error occurred - " + error);

    log(`Following error occurred - ${error}`);
    let ERROR_SUBJECT = "Script Failed";
    let ERROR_TEXT = `Script failed with this error - ${error}`;
    let ERROR_HTML = `<strong>Script failed with this error - ${error}</strong>`;
    await sendEmailNotification(ERROR_SUBJECT, ERROR_TEXT, ERROR_HTML);

    // waiting to complete above tasks
    console.log("end");
    setTimeout(() => {
      process.exit();
    }, 10000);
  }
  // Close the browser
  await driver.quit();
}

// Run the script initially
runScript();

// Run the script every 3 minutes
setInterval(runScript, 5 * 60 * 1000); // 3 minutes in milliseconds
