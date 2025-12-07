# Docker Üzerinde Blockchain ve Akıllı Kontrat ile Sertifika Doğrulama Sistemi

Bu proje, **Konya Teknik Üniversitesi - Dijital Dönüşüme Giriş** dersi proje ödevi kapsamında geliştirilmiştir. Docker tabanlı bir blokzincir altyapısı üzerinde çalışan, KVKK uyumlu ve güvenli bir dijital sertifika oluşturma, doğrulama ve iptal sistemidir.

## 🎯 Projenin Amacı

Sahte diploma ve sertifikaların önüne geçmek amacıyla, sertifika verilerinin özetlerini (hash) blokzincire değişmez bir şekilde kaydetmek ve üçüncü tarafların bu sertifikaları herhangi bir kuruma başvurmadan doğrulayabilmesini sağlamaktır.

## 🚀 Özellikler

* **Dockerize Mimari:** Tüm sistem (Blockchain, Hardhat, Client) `docker-compose` ile izole bir ağ üzerinde çalışır.
* **Akıllı Kontrat:** Sertifika kayıt (issue), iptal (revoke) ve doğrulama (verify) işlemleri Solidity ile yazılmış kontrat üzerinden yönetilir.
* **Veri Gizliliği (KVKK):** Kişisel veriler (Ad, Soyad, Öğrenci No) zincire asla açık yazılmaz. `Keccak256` hashing ve `Salt` (tuzlama) kullanılarak gizlilik sağlanır.
* İstemci (CLI):** Node.js tabanlı komut satırı arayüzü ile sertifika işlemleri yapılır.

## 🛠 Teknik Yığın

* **Docker & Docker Compose:** Çoklu konteyner yönetimi.
* **Ganache:** Yerel EVM uyumlu blokzincir ağı.
* **Hardhat:** Akıllı kontrat derleme, test ve dağıtım (Deploy) aracı.
* **Node.js & Ethers.js:** İstemci ve blokzincir etkileşimi.

## ⚙️ Kurulum ve Çalıştırma

Projeyi çalıştırmak için bilgisayarınızda **Docker Desktop** kurulu olmalıdır.

### 1. Sistemi Başlatma

Terminali proje dizininde açın ve servisleri ayağa kaldırın:

```bash
docker-compose up -d
```

Bu komut `ganache`, `hardhat` ve `client` konteynerlerini başlatır ve `certnet` ağını kurar.

### 2. Yönetici Anahtarını (Private Key) Alma

Ganache ağındaki yetkili hesabın anahtarını öğrenmek için:

```bash
docker-compose logs ganache
```

Çıktıdaki **Private Keys** listesinden `(0)` numaralı anahtarı kopyalayın .

### 3. Akıllı Kontratı Yükleme (Deploy)

Hardhat konteynerine bağlanıp kontratı zincire yükleyin:

```bash
docker-compose exec hardhat bash
# Konteyner içinde:
npm install
npx hardhat run scripts/deploy.js --network ganache
```

İşlem sonunda verilen **Kontrat Adresini (Contract Address)** kopyalayın .

### 4. İstemciyi Çalıştırma

Yeni bir terminalde istemciye bağlanın:

```bash
docker-compose exec client bash
# Konteyner içinde:
npm install
node index.js
```

Sistem açıldığında sizden **Private Key** ve **Kontrat Adresini** isteyecektir.

## 🧪 Kullanım Senaryoları

### 1. Sertifika Oluşturma (Issue)

- Menüden sertifika oluşturma seçeneğini seçin.

- Öğrenci bilgilerini girin.

- Sistem size bir **Sertifika ID** ve **SALT** değeri verecektir. Bu bilgileri (özellikle SALT) kaybetmeyin, doğrulama için zorunludur.

### 2. Sertifika Doğrulama (Verify)

- Doğrulama menüsüne girin.

- Elinizdeki `ID`, `Öğrenci Bilgileri` ve `SALT` değerini girin.

- Sistem blokzincirdeki hash ile hesaplanan hash'i karşılaştırarak sertifikanın geçerli olup olmadığını söyler.

### 3. Sertifika İptali (Revoke)

- Hatalı verilen bir sertifikayı ID'si ile iptal edebilirsiniz. İptal edilen sertifikalar doğrulama sorgusunda "Geçersiz" olarak görünür.



## 📂 Proje Yapısı

```
.
├── docker-compose.yml   # Servis ve ağ tanımları
├── client/              # Node.js İstemci kodları
└── dapp/                # Hardhat ve Smart Contract
    ├── contracts/       # CertificateRegistry.sol
    └── scripts/         # deploy.js
```


