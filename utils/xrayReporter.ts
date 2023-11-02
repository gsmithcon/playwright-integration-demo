import type {
    Reporter,
    FullConfig,
    Suite,
    TestCase,
    TestResult,
    FullResult,
  } from "@playwright/test/reporter";
  import { envSchema } from "../envSchema";
  import axios from "axios";
  require("dotenv").config();
  
  let env = envSchema.parse(process.env);
  let cycleName;
  class XrayReporter implements Reporter {
    onBegin(config: FullConfig, suite: Suite) {
    }
  
    onTestBegin(test: TestCase, result: TestResult) {
    }
  
    onTestEnd(test: TestCase, result: TestResult) {
    }
  
    async onEnd(result: FullResult) {
      // if process.env.REPORT_TO_JIRA is false, do not send report to xray
      if (!env.REPORT_TO_JIRA) {
        console.log("REPORT_TO_JIRA is false, skipping sending report to xray");
        return;
      }
      console.log("sending report to xray...");
      // print success to conosole if junit.xml exists in test-results folder
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(__dirname, "../test-results/junit.xml");
      if (fs.existsSync(filePath)) {
        // send junit.xml to xray
        const data = fs.readFileSync(filePath);
        await this.sendXmlToXray(data);
      } else {
        console.log("junit.xml not found");
      }


    }

    async getXrayToken() {
      let xrayToken = "";
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const data = {
        client_id: env.XRAY_CLIENT_ID,
        client_secret: env.XRAY_CLIENT_SECRET,
      };
      await axios
        .post("https://xray.cloud.getxray.app/api/v1/authenticate", data, config)
        .then((res) => {
          console.log("token received from xray");
          //console.log(res.data);
          xrayToken = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
      return xrayToken;
    }

    async sendXmlToXray(data: any) {
      const xrayToken = await this.getXrayToken();
      const config = {
        headers: {
          "Content-Type": "application/xml",
          Authorization: `Bearer ${xrayToken}`,
        },
        params: {
          projectKey: env.PROJECT_KEY,
        }
      };
      await axios
        .post("https://xray.cloud.getxray.app/api/v1/import/execution/junit", data, config)
        .then((res) => {
          console.log("junit.xml sent to xray");
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      }
  }
  export default XrayReporter;
  