export async function parseIpa(filePath) {
  await new Promise((resolve, reject) => {
    console.log("Parsing IPA file...");
    // wait for 5 seconds
    setTimeout(() => {
      console.log("Parsing IPA file done!");
      resolve("done");
    }, 2000);
  });
}
