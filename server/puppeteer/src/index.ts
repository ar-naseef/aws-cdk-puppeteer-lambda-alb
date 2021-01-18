import chromium from "chrome-aws-lambda";
import { wrapResponse } from "../../packages";

const {
  AWS_LAMBDA_FUNCTION_NAME,
  CHROMIUM_BIN,
  IS_LOCAL,
  BUCKET_NAME,
} = process.env;

let puppeteer;
let chromiumArgs = [
  "--no-sandbox",
  "--disable-gpu",
  "--ignore-certificate-errors",
];
let chromiumBin = Promise.resolve(CHROMIUM_BIN);
let chromiumViewPort: { width: number; height: number } | undefined = undefined;
let headless = false;

if (AWS_LAMBDA_FUNCTION_NAME) {
  // const chromium = require("chrome-aws-lambda");
  puppeteer = chromium.puppeteer;
  chromiumArgs = [...chromiumArgs, "--headless"].concat(chromium.args);
  chromiumBin = chromium.executablePath;
  chromiumViewPort = chromium.defaultViewport;
  headless = chromium.headless;
}
//  else {
//   puppeteer = require("puppeteer");
// }

export const handler = async (event) => {
  console.log("event >>>", event);
  // const body = JSON.parse(event.body);

  // TODO:
  // islocal is an env variable set from aws cdk. based on that, puppeteer (which will be installed locally) or
  // chrome-aws-lambda will be used.

  console.log("IS_LOCAL >>>", IS_LOCAL);
  console.log("BUCKET_NAME >>>", BUCKET_NAME);
  try {
    console.log("await chromium.executablePath>>>", await chromiumBin);
    console.log("chromium.args>>>", chromiumArgs);
    console.log("chromium.headless>>>", headless);
    console.log("chromium.defaultViewport>>>>", chromiumViewPort);
    const browser = await puppeteer.launch({
      args: chromiumArgs,
      defaultViewport: chromiumViewPort,
      executablePath: await chromiumBin,
      headless: headless,
    });
    const page = await browser.newPage();

    await page.goto("https://quotes.toscrape.com/");

    console.log("Page opened");
    const text = await page.$eval(
      "body > div.container > div:nth-child(2) > div.col-md-8 > div:nth-child(1) > span.text",
      (elem: any) => {
        return elem.innerText;
      }
    );

    await browser.close();

    return wrapResponse({
      status: "ok",
      message: "done",
      data: {
        text,
      },
    });
  } catch (e) {
    console.log(e);
    console.log("error");
    return wrapResponse({
      status: "error",
      message: "Error",
      error: e.message,
    });
  }
};
