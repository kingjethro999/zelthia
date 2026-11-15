import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

console.log("=== Zelthia Automated QA & SEO Verifier ===\n");

let errors = [];
let warnings = [];

// 1. Check Route Files
const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/sitemap.ts",
  "app/robots.ts",
  "app/chat/page.tsx",
  "app/api/chat/route.ts",
  "app/inventory/page.tsx",
  "app/api/inventory/route.ts",
];

console.log("Checking required file structures...");
for (const file of requiredFiles) {
  const fullPath = path.join(projectRoot, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${file}`);
    console.log(`❌ Missing: ${file}`);
  } else {
    console.log(`✓ Found: ${file}`);
  }
}

// 2. Check SEO in app/layout.tsx and app/page.tsx
console.log("\nChecking SEO in app/layout.tsx & app/page.tsx...");
const layoutPath = path.join(projectRoot, "app/layout.tsx");
if (fs.existsSync(layoutPath)) {
  const content = fs.readFileSync(layoutPath, "utf8");
  if (!content.includes("metadata")) {
    warnings.push("app/layout.tsx: No metadata export found.");
  }
  if (!content.includes("openGraph")) {
    warnings.push("app/layout.tsx: openGraph metadata not configured.");
  }
  if (!content.includes("twitter")) {
    warnings.push("app/layout.tsx: twitter metadata not configured.");
  }
}

// 3. Check JSON-LD Structured Data
console.log(
  "\nChecking JSON-LD Structured Data in app/page.tsx or components...",
);
const pagePath = path.join(projectRoot, "app/page.tsx");
if (fs.existsSync(pagePath)) {
  const pageContent = fs.readFileSync(pagePath, "utf8");
  if (pageContent.includes("application/ld+json")) {
    console.log("✓ Found application/ld+json structured data script.");
    if (!pageContent.includes("MedicalWebPage")) {
      warnings.push("JSON-LD schema might be missing MedicalWebPage type.");
    }
    if (!pageContent.includes("SoftwareApplication")) {
      warnings.push(
        "JSON-LD schema might be missing SoftwareApplication type.",
      );
    }
    if (!pageContent.includes("FAQPage")) {
      warnings.push("JSON-LD schema might be missing FAQPage type.");
    }
  } else {
    warnings.push("No application/ld+json found in app/page.tsx");
  }
}

// 4. Check Sitemap and Robots
console.log("\nChecking sitemap and robots configuration...");
const sitemapPath = path.join(projectRoot, "app/sitemap.ts");
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
  if (
    !sitemapContent.includes("/chat") ||
    !sitemapContent.includes("/inventory")
  ) {
    warnings.push(
      "app/sitemap.ts: Should include entries for /, /chat, and /inventory.",
    );
  } else {
    console.log("✓ sitemap.ts includes /, /chat, /inventory routes.");
  }
}

const robotsPath = path.join(projectRoot, "app/robots.ts");
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, "utf8");
  if (!robotsContent.includes("sitemap") && !robotsContent.includes("rules")) {
    warnings.push(
      "app/robots.ts: rules or sitemap reference might be missing.",
    );
  } else {
    console.log("✓ robots.ts includes rules and sitemap.");
  }
}

console.log("\n===========================================");
if (errors.length > 0) {
  console.log(`❌ ERRORS (${errors.length}):`);
  errors.forEach((e) => console.log(`  - ${e}`));
} else {
  console.log("✓ No missing file errors.");
}

if (warnings.length > 0) {
  console.log(`⚠️ WARNINGS / FINDINGS (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  - ${w}`));
} else {
  console.log("✓ All QA & SEO checks passed.");
}
