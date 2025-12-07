const hre = require("hardhat");

async function main() {
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");

  console.log("Kontrat Ganache agina yukleniyor...");
  const registry = await CertificateRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log("----------------------------------------------------");
  console.log("BASARILI! Kontrat Adresi:", address);
  console.log("Bu adresi kopyalayip Client uygulamasina yapistiracaksin.");
  console.log("----------------------------------------------------");
}

// Hata yakalama mekanizması
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});