/* eslint-disable */
const {spawn} = require('child_process')
const BIN_PATH = require.resolve('lighthouse/lighthouse-cli/index.js')

module.exports = class LightHouseReportManager {
  static generate(paramUrls) {
    const urls = !Array.isArray(paramUrls) ? [paramUrls] : paramUrls;
    let lighthouseReports = [];
    urls.forEach(url => {
      lighthouseReports.push(
        new Promise((resolve, reject) => {
          const child = spawn("node", [
            BIN_PATH,
            url,
            "--output=json",
            '--chrome-flags="--headless"'
          ]);
          let report = "";
          let counter = 0;
          // use child.stdout.setEncoding('utf8'); if you want text chunks
          child.stdout.on("data", chunk => {
            // data from standard output is here as buffers
            report += chunk.toString();
          });

          child.on("close", code => {
            if(report){
            !code
              ? resolve({
                  report: JSON.parse(report)
                })
              : resolve({ report: JSON.parse(report) });
              } else {
                reject(new Error('No report was generated, this may be caused because the url can be accesed. Is your url a accesible?'))
              }
          });
        })
      );
    });

    return lighthouseReports;
  }

  static parseReport(report, scoreThresholds) {
    const parsedCategories = {};
    const categories = report.report.categories;
    Object.keys(categories).forEach(categoryName => {
      parsedCategories[categoryName] = {
        score: categories[categoryName].score * 100,
        scoreThreshold: scoreThresholds[categoryName],
        pass:
          categories[categoryName].score * 100 >= scoreThresholds[categoryName]
      };
    });

    return {
      url: report.report.finalUrl,
      categories: parsedCategories
    };
  }

  static getMarkDownTable(report) {
    let table = `
## Lighthouse report for the URL: **${report.url}**

| Category   | Score | Threshold  | Pass |
| ------------- | ------------- | ------------- | ------------- |
`;
    Object.keys(report.categories).forEach((categoryName, index) => {
      if (index === 0) {
        table += `| ${categoryName}  | ${report.categories[categoryName].score}  | ${report.categories[categoryName].scoreThreshold}  |  ${report.categories[categoryName].pass ? "✅" : "❌"}  |
`;
      } else {
        table += `| ${categoryName}  | ${report.categories[categoryName].score}  | ${report.categories[categoryName].scoreThreshold}  |  ${report.categories[categoryName].pass ? "✅" : "❌"}  |
`;
      }
    });

    return table;
  }
};
