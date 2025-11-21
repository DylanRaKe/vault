import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { getItemById, updateItem } from "@/lib/items";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  return !!authHeader;
}

function getFileExtension(path: string): string {
  return path.split('.').pop()?.toLowerCase() || '';
}

function isPdf(path: string): boolean {
  return getFileExtension(path) === 'pdf';
}

function isImage(path: string): boolean {
  const ext = getFileExtension(path);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

async function convertImageToPdf(imagePath: string): Promise<Uint8Array> {
  const fullPath = join(process.cwd(), "public", imagePath);
  const imageBuffer = await readFile(fullPath);
  const ext = getFileExtension(imagePath);
  
  // Créer un nouveau PDF avec l'image
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  
  let image;
  let width: number;
  let height: number;

  // Embed l'image selon son format
  if (ext === 'png') {
    image = await pdfDoc.embedPng(imageBuffer);
    const dims = image.scale(1);
    width = dims.width;
    height = dims.height;
  } else if (['jpg', 'jpeg'].includes(ext)) {
    image = await pdfDoc.embedJpg(imageBuffer);
    const dims = image.scale(1);
    width = dims.width;
    height = dims.height;
  } else {
    // Pour les autres formats (gif, webp), convertir en PNG avec sharp
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    image = await pdfDoc.embedPng(pngBuffer);
    const dims = image.scale(1);
    width = dims.width;
    height = dims.height;
  }
  
  // Ajuster la taille de la page à l'image
  page.setSize(width, height);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width,
    height,
  });

  return await pdfDoc.save();
}

async function loadPdf(pdfPath: string): Promise<PDFDocument> {
  const fullPath = join(process.cwd(), "public", pdfPath);
  const pdfBytes = await readFile(fullPath);
  return await PDFDocument.load(pdfBytes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const item = await getItemById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Récupérer tous les fichiers (files uniquement), en excluant les PDF fusionnés existants
    const allFiles: string[] = [];
    if (item.files && item.files.length > 0) {
      // Exclure les fichiers qui sont des PDF fusionnés
      const nonMergedFiles = item.files.filter(f => !f.includes('merged-'));
      allFiles.push(...nonMergedFiles);
    }

    if (allFiles.length < 2) {
      return NextResponse.json(
        { error: "At least 2 files are required for merging" },
        { status: 400 }
      );
    }

    // Vérifier que tous les fichiers sont PDF ou images
    const invalidFiles = allFiles.filter(
      (file) => !isPdf(file) && !isImage(file)
    );
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: "All files must be PDF or images" },
        { status: 400 }
      );
    }

    // Créer un nouveau PDF document
    const mergedPdf = await PDFDocument.create();

    // Traiter chaque fichier
    for (const filePath of allFiles) {
      if (isPdf(filePath)) {
        // Charger et copier les pages du PDF
        const pdfDoc = await loadPdf(filePath);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      } else if (isImage(filePath)) {
        // Convertir l'image en PDF et l'ajouter
        const imagePdfBytes = await convertImageToPdf(filePath);
        const imagePdf = await PDFDocument.load(imagePdfBytes);
        const pages = await mergedPdf.copyPages(
          imagePdf,
          imagePdf.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      }
    }

    // Sauvegarder le PDF fusionné
    const mergedPdfBytes = await mergedPdf.save();
    const filename = `merged-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
    const outputPath = join(process.cwd(), "public", "uploads", filename);
    await writeFile(outputPath, mergedPdfBytes);

    const publicPath = `/uploads/${filename}`;

    // Ajouter le PDF fusionné aux fichiers de l'item
    const currentFiles = item.files || [];
    const updatedFiles = [...currentFiles, publicPath];

    await updateItem(id, {
      files: updatedFiles,
    });

    return NextResponse.json({
      success: true,
      path: publicPath,
    });
  } catch (error) {
    console.error("Error merging files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

