import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set to connect to PostgreSQL.");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

const sampleData = [
  // Documents administratifs
  {
    title: "Passeport",
    content: "Numéro: XX123456\nExpire le: 15/03/2028\nPays: France",
    type: "text" as const,
    keywords: ["administratif", "papier", "passport", "identité"],
  },
  {
    title: "Carte d'identité",
    content: "Numéro: 123456789\nExpire le: 20/05/2029",
    type: "text" as const,
    keywords: ["administratif", "papier", "identité", "cni"],
  },
  {
    title: "Permis de conduire",
    content: "Numéro: 987654321\nCatégories: B, A1\nExpire le: 10/12/2030",
    type: "text" as const,
    keywords: ["administratif", "papier", "permis", "conduite"],
  },
  {
    title: "Carte Vitale",
    content: "Numéro de sécurité sociale: 1 23 45 67 89 012 34",
    type: "text" as const,
    keywords: ["administratif", "santé", "vitale", "sécurité sociale"],
  },
  {
    title: "Attestation de domicile",
    content: "Adresse: 123 Rue Example, 75001 Paris\nDélivrée le: 01/01/2024",
    type: "text" as const,
    keywords: ["administratif", "papier", "domicile", "justificatif"],
  },
  {
    title: "Avis d'imposition",
    content: "Année: 2023\nRevenus imposables: 45000€\nImpôt: 3200€",
    type: "text" as const,
    keywords: ["administratif", "fiscal", "impôt", "revenus"],
  },
  {
    title: "Contrat de travail",
    content: "Poste: Développeur Full Stack\nSalaire: 55000€/an\nDate début: 01/09/2023",
    type: "text" as const,
    keywords: ["work", "contrat", "emploi", "salaire"],
  },
  {
    title: "Fiche de paie",
    content: "Mois: Décembre 2023\nSalaire net: 4200€\nEntreprise: Tech Corp",
    type: "text" as const,
    keywords: ["work", "salaire", "paie", "décembre"],
  },
  {
    title: "Attestation employeur",
    content: "Confirme l'emploi depuis le 01/09/2023\nPoste: Développeur",
    type: "text" as const,
    keywords: ["work", "attestation", "employeur"],
  },
  {
    title: "RIB",
    content: "IBAN: FR76 1234 5678 9012 3456 7890 123\nBIC: ABCDFRPP",
    type: "text" as const,
    keywords: ["administratif", "banque", "rib", "compte"],
  },
  {
    title: "Assurance habitation",
    content: "Compagnie: AssurCorp\nNuméro: ASS-123456\nExpire le: 31/12/2024",
    type: "text" as const,
    keywords: ["administratif", "assurance", "habitation", "logement"],
  },
  {
    title: "Assurance voiture",
    content: "Compagnie: AutoAssur\nNuméro: AUTO-789012\nVéhicule: Peugeot 208",
    type: "text" as const,
    keywords: ["administratif", "assurance", "voiture", "véhicule"],
  },
  {
    title: "Carte grise",
    content: "Immatriculation: AB-123-CD\nMarque: Peugeot\nModèle: 208",
    type: "text" as const,
    keywords: ["administratif", "voiture", "carte grise", "véhicule"],
  },
  {
    title: "Contrat de location",
    content: "Adresse: 123 Rue Example, 75001 Paris\nLoyer: 1200€/mois\nBail: 01/01/2023 - 31/12/2025",
    type: "text" as const,
    keywords: ["administratif", "logement", "location", "bail"],
  },
  {
    title: "Quittance de loyer",
    content: "Mois: Décembre 2023\nMontant: 1200€\nReçu le: 05/12/2023",
    type: "text" as const,
    keywords: ["administratif", "logement", "loyer", "quittance"],
  },
  {
    title: "Facture EDF",
    content: "Période: Novembre 2023\nMontant: 85€\nRéférence: EDF-123456",
    type: "text" as const,
    keywords: ["administratif", "facture", "électricité", "edf"],
  },
  {
    title: "Facture Internet",
    content: "Opérateur: Free\nMontant: 29.99€/mois\nForfait: Fibre 1Gb",
    type: "text" as const,
    keywords: ["administratif", "facture", "internet", "free"],
  },
  {
    title: "Carte de mutuelle",
    content: "Numéro: MUT-123456\nTiers payant: Oui\nCouverture: 100%",
    type: "text" as const,
    keywords: ["administratif", "santé", "mutuelle", "assurance"],
  },
  {
    title: "Ordonnance médicale",
    content: "Médecin: Dr. Martin\nDate: 15/12/2023\nMédicaments: Paracétamol, Ibuprofène",
    type: "text" as const,
    keywords: ["santé", "médecin", "ordonnance", "médicament"],
  },
  {
    title: "Carnet de vaccination",
    content: "COVID-19: 3 doses\nTétanos: 10/05/2020\nRappel: 10/05/2025",
    type: "text" as const,
    keywords: ["santé", "vaccination", "covid", "tétanos"],
  },
  {
    title: "Diplôme universitaire",
    content: "Master Informatique\nUniversité Paris-Saclay\nAnnée: 2022",
    type: "text" as const,
    keywords: ["work", "éducation", "diplôme", "master"],
  },
  {
    title: "Certificat de formation",
    content: "Formation: React Avancé\nOrganisme: Tech Academy\nDate: 15/11/2023",
    type: "text" as const,
    keywords: ["work", "formation", "react", "certificat"],
  },
  {
    title: "Contrat freelance",
    content: "Client: StartupXYZ\nProjet: Application web\nMontant: 8000€",
    type: "text" as const,
    keywords: ["work", "freelance", "contrat", "client"],
  },
  {
    title: "Facture freelance",
    content: "Client: StartupXYZ\nMontant: 2000€\nDate: 01/12/2023",
    type: "text" as const,
    keywords: ["work", "freelance", "facture", "client"],
  },
  {
    title: "Relevé bancaire",
    content: "Période: Novembre 2023\nSolde: 5420€\nCompte: Courant",
    type: "text" as const,
    keywords: ["administratif", "banque", "relevé", "compte"],
  },
  {
    title: "Carte de crédit",
    content: "Numéro: 4532 **** **** 1234\nExpire: 12/25\nLimite: 3000€",
    type: "text" as const,
    keywords: ["administratif", "banque", "carte", "crédit"],
  },
  {
    title: "Code WiFi",
    content: "SSID: Freebox-XXXX\nMot de passe: ABC123XYZ789",
    type: "text" as const,
    keywords: ["logement", "wifi", "internet", "mot de passe"],
  },
  {
    title: "Codes d'accès immeuble",
    content: "Porte principale: 1234#\nInterphone: Appartement 5B\nDigicode: 5678A",
    type: "text" as const,
    keywords: ["logement", "codes", "accès", "immeuble"],
  },
  {
    title: "Numéro de série ordinateur",
    content: "MacBook Pro: SN-ABC123XYZ\nAcheté le: 15/03/2023\nGarantie jusqu'au: 15/03/2026",
    type: "text" as const,
    keywords: ["work", "matériel", "ordinateur", "série"],
  },
  {
    title: "Licence logiciel",
    content: "Logiciel: Adobe Creative Suite\nLicence: 123456-789012-345678\nExpire: 31/12/2024",
    type: "text" as const,
    keywords: ["work", "logiciel", "licence", "adobe"],
  },
  {
    title: "Identifiants GitHub",
    content: "Username: devuser\nEmail: dev@example.com\n2FA: Activé",
    type: "text" as const,
    keywords: ["work", "développement", "github", "identifiants"],
  },
  {
    title: "Identifiants AWS",
    content: "Account ID: 123456789012\nRegion: eu-west-1\nIAM User: dev-user",
    type: "text" as const,
    keywords: ["work", "cloud", "aws", "identifiants"],
  },
  {
    title: "Token API",
    content: "Service: Stripe\nToken: sk_live_ABC123...\nCréé le: 01/01/2024",
    type: "text" as const,
    keywords: ["work", "api", "token", "stripe"],
  },
  {
    title: "Certificat SSL",
    content: "Domaine: example.com\nExpire: 15/06/2024\nÉmis par: Let's Encrypt",
    type: "text" as const,
    keywords: ["work", "ssl", "certificat", "domaine"],
  },
  {
    title: "Backup base de données",
    content: "Dernier backup: 15/12/2023 02:00\nTaille: 2.5 GB\nEmplacement: S3 bucket",
    type: "text" as const,
    keywords: ["work", "backup", "base de données", "s3"],
  },
  {
    title: "Documentation projet",
    content: "Projet: E-commerce Platform\nRepo: github.com/company/project\nDocs: Notion",
    type: "text" as const,
    keywords: ["work", "projet", "documentation", "github"],
  },
  {
    title: "Planning sprint",
    content: "Sprint 15: 18/12 - 01/01\nÉquipe: 5 développeurs\nObjectifs: Features X, Y, Z",
    type: "text" as const,
    keywords: ["work", "planning", "sprint", "agile"],
  },
  {
    title: "Notes réunion",
    content: "Réunion: Review Q4 2023\nDate: 10/12/2023\nPoints: Budget, Roadmap 2024",
    type: "text" as const,
    keywords: ["work", "réunion", "notes", "review"],
  },
  {
    title: "Contrat de prestation",
    content: "Client: BigCorp\nPrestation: Développement API\nMontant: 15000€",
    type: "text" as const,
    keywords: ["work", "contrat", "prestation", "client"],
  },
  {
    title: "Devis",
    content: "Client: StartupABC\nPrestation: Site web\nMontant: 5000€\nValide jusqu'au: 31/01/2024",
    type: "text" as const,
    keywords: ["work", "devis", "client", "prestation"],
  },
  {
    title: "Carte de visite",
    content: "Nom: John Doe\nPoste: Développeur Full Stack\nEmail: john@example.com\nTél: +33 6 12 34 56 78",
    type: "text" as const,
    keywords: ["work", "contact", "carte de visite", "réseau"],
  },
  {
    title: "Identifiants serveur",
    content: "IP: 192.168.1.100\nUser: root\nPort SSH: 22\nOS: Ubuntu 22.04",
    type: "text" as const,
    keywords: ["work", "serveur", "ssh", "infrastructure"],
  },
  {
    title: "Configuration DNS",
    content: "Domaine: example.com\nA Record: 192.0.2.1\nCNAME: www -> example.com",
    type: "text" as const,
    keywords: ["work", "dns", "domaine", "configuration"],
  },
  {
    title: "Backup code source",
    content: "Dernier backup: 15/12/2023\nRepos: 25 projets\nTaille totale: 15 GB",
    type: "text" as const,
    keywords: ["work", "backup", "code", "git"],
  },
  {
    title: "Mots de passe importants",
    content: "Email principal: ********\nCompte admin: ********\nVPN: ********",
    type: "text" as const,
    keywords: ["sécurité", "mots de passe", "accès", "comptes"],
  },
  {
    title: "Codes de récupération",
    content: "2FA Backup Codes: ABC123, DEF456, GHI789\nGarder en lieu sûr",
    type: "text" as const,
    keywords: ["sécurité", "2fa", "backup codes", "récupération"],
  },
  {
    title: "Clé de chiffrement",
    content: "Clé GPG: 0x1234567890ABCDEF\nFingerprint: ABC1 2345 6789 0ABC DEF1 2345 6789 0ABC DEF1 2345",
    type: "text" as const,
    keywords: ["sécurité", "gpg", "chiffrement", "clé"],
  },
  {
    title: "Informations compte crypto",
    content: "Wallet: MetaMask\nAdresse: 0x1234...5678\nRéseau: Ethereum Mainnet",
    type: "text" as const,
    keywords: ["crypto", "wallet", "ethereum", "blockchain"],
  },
  {
    title: "Seed phrase",
    content: "12 mots de récupération:\n1. word1 2. word2 3. word3...\n⚠️ CONFIDENTIEL",
    type: "text" as const,
    keywords: ["crypto", "seed", "récupération", "wallet"],
  },
  {
    title: "Identifiants échange",
    content: "Plateforme: Binance\nEmail: user@example.com\n2FA: Activé",
    type: "text" as const,
    keywords: ["crypto", "échange", "binance", "identifiants"],
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.item.deleteMany();
  console.log("🗑️  Cleared existing items");

  // Create items
  for (const data of sampleData) {
    await prisma.item.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        keywords: JSON.stringify(data.keywords),
      },
    });
  }

  console.log(`✅ Created ${sampleData.length} items`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

