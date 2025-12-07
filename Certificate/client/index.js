import { ethers } from "ethers";
import readline from "readline-sync";
import fs from "fs";

const RPC_URL = process.env.RPC_URL || "http://localhost:8545";

const CONTRACT_ABI = [
  "function issue(bytes32 id, bytes32 holderHash, string title, string issuer, uint64 expiresAt) external",
  "function revoke(bytes32 id) external",
  "function verify(bytes32 id, bytes32 holderHash) external view returns (bool valid, bool isRevoked, uint64 issuedAt, uint64 expiresAt, string title, string issuer)",
  "event CertificateIssued(bytes32 indexed id, bytes32 indexed holderHash, string title, string issuer, uint64 issuedAt, uint64 expiresAt)",
  "event CertificateRevoked(bytes32 indexed id, uint64 revokedAt)"
];

async function main() {
    console.log("=== SERTIFIKA SISTEMINE HOS GELDINIZ ===");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const privateKey = readline.question("Lutfen Yonetici Private Key giriniz (Ganache'dan): ", { hideEchoBack: true });
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractAddress = readline.question("Lutfen Kontrat Adresini giriniz (Deploy edince cikan): ");
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

    console.log("\nBaglanti basarili! Yonetici Adresi:", wallet.address);

    while (true) {
        console.log("\n--- MENU ---");
        console.log("1. Sertifika Olustur (Issue)");
        console.log("2. Sertifika Sorgula (Verify)");
        console.log("3. Sertifika Iptal Et (Revoke)");
        console.log("4. Cikis");
        
        const choice = readline.question("Seciminiz (1-4): ");

        if (choice === "1") {
            await issueCertificate(contract);
        } else if (choice === "2") {
            await verifyCertificate(contract);
        } else if (choice === "3") {
            await revokeCertificate(contract);
        } else if (choice === "4") {
            break;
        } else {
            console.log("Gecersiz secim.");
        }
    }
}

function generateHolderHash(ogrNo, adSoyad, salt) {
    const data = `${ogrNo}|${adSoyad.toUpperCase().trim()}|${salt}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
}

async function issueCertificate(contract) {
    console.log("\n-- SERTIFIKA OLUSTURMA --");
    const ogrNo = readline.question("Ogrenci No: ");
    const adSoyad = readline.question("Ad Soyad: ");
    const title = readline.question("Sertifika Basligi (Or: Yazilim Uzmanligi): ");
    const issuer = "Konya Teknik Universitesi";
    
    const salt = ethers.hexlify(ethers.randomBytes(16));
    console.log(`DIKKAT: Bu SALT degerini saklayin, dogrulama icin gerekli: ${salt}`);

    const holderHash = generateHolderHash(ogrNo, adSoyad, salt);
    const id = ethers.hexlify(ethers.randomBytes(32));
    const expiresAt = 0;

    try {
        console.log("Islem gonderiliyor...");
        const tx = await contract.issue(id, holderHash, title, issuer, expiresAt);
        await tx.wait();
        console.log("BASARILI! Sertifika ID'si (Bunu da saklayin):", id);
    } catch (e) {
        console.error("Hata:", e.message);
    }
}

async function verifyCertificate(contract) {
    console.log("\n-- SERTIFIKA DOGRULAMA --");
    const id = readline.question("Sertifika ID: ");
    const ogrNo = readline.question("Ogrenci No: ");
    const adSoyad = readline.question("Ad Soyad: ");
    const salt = readline.question("Salt Degeri: ");

    const holderHash = generateHolderHash(ogrNo, adSoyad, salt);

    try {
        const result = await contract.verify(id, holderHash);
        
        if (result[0] === true) { // valid
            console.log("\n*** SERTIFIKA GECERLI ***");
            console.log("Baslik:", result[4]);
            console.log("Veren Kurum:", result[5]);
            console.log("Verilis Tarihi:", new Date(Number(result[2]) * 1000).toLocaleString());
        } else {
            console.log("\n!!! SERTIFIKA GECERSIZ !!!");
            if (result[1]) console.log("Sebep: Sertifika IPTAL edilmis.");
            else console.log("Sebep: Bilgiler eslesmiyor veya kayit yok.");
        }
    } catch (e) {
        console.error("Hata:", e.message);
    }
}

async function revokeCertificate(contract) {
    console.log("\n-- SERTIFIKA IPTAL ETME --");
    const id = readline.question("Iptal edilecek Sertifika ID: ");
    try {
        const tx = await contract.revoke(id);
        await tx.wait();
        console.log("Sertifika basariyla iptal edildi.");
    } catch (e) {
        console.error("Hata:", e.message);
    }
}

main();