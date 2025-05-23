const puppeteer = require("puppeteer");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = async function main(context) {
  const { fileKey, nodeId, campo, cookie } = context.input;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // Autenticación
  await page.setCookie({
    name: "__Host-figma.authn",
    value: cookie,
    domain: ".figma.com",
    path: "/",
    httpOnly: true,
    secure: true,
  });

  const url = `https://www.figma.com/file/${fileKey}?type=dev&node-id=${nodeId}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  await delay(6000); // Espera que cargue el modo Dev

  // Buscar el frame que comienza con $$campo
  const frameNode = await page.$x(`//*[starts-with(text(), '$$${campo}')]`);
  if (frameNode.length === 0) {
    throw new Error("No se encontró el frame con nombre $$" + campo);
  }
  await frameNode[0].click();
  await delay(1000);

  // Buscar el video &&Video
  const videoNode = await page.$x(`//*[starts-with(text(), '&&Video')]`);
  if (videoNode.length === 0) {
    throw new Error("No se encontró el nodo &&Video");
  }
  await videoNode[0].click();
  await delay(1000);

  // Ir al panel de Assets y obtener el link del .mp4
  const assetUrl = await page.evaluate(() => {
    const container = [...document.querySelectorAll("div")]
      .find((el) => el.textContent.includes(".mp4"));
    const link = container?.querySelector("a");
    return link?.href;
  });

  await browser.close();

  return { downloadUrl: assetUrl || null };
};
