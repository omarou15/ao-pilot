import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";
import { getServiceClient } from "@/lib/supabase";
import type { MemoireSection, Project, Company } from "@/lib/types";

/**
 * Generate a Mémoire Technique .docx for a project.
 * Structure: title page, table of contents, then each section.
 */
export async function generateMemoirDocx(projectId: string): Promise<Buffer> {
  const supabase = getServiceClient();

  // Fetch project, company, and sections in parallel
  const [projectResult, sectionsResult] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase
      .from("memoire_sections")
      .select("*")
      .eq("project_id", projectId)
      .order("section_order", { ascending: true }),
  ]);

  if (projectResult.error || !projectResult.data) {
    throw new Error(
      `Failed to fetch project: ${projectResult.error?.message ?? "not found"}`
    );
  }

  const project: Project = projectResult.data;
  const sections: MemoireSection[] = sectionsResult.data ?? [];

  // Fetch company info
  let companyName = "Entreprise";
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", project.company_id)
    .single();

  if (company) {
    companyName = (company as Company).name;
  }

  const today = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- Title page children ---
  const titlePageChildren: Paragraph[] = [
    new Paragraph({ spacing: { before: 3000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: companyName, bold: true, size: 56, font: "Calibri" }),
      ],
    }),
    new Paragraph({ spacing: { after: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Mémoire Technique",
          bold: true,
          size: 48,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: project.name, size: 36, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: project.reference ? `Réf. ${project.reference}` : "",
          size: 24,
          font: "Calibri",
          italics: true,
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 1200 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: today, size: 24, font: "Calibri", color: "666666" }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  // --- Table of contents (simple numbered list) ---
  const tocChildren: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [
        new TextRun({ text: "Table des matières", bold: true, size: 32 }),
      ],
    }),
    ...sections.map(
      (section, index) =>
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `${index + 1}. ${section.title}`,
              size: 24,
              font: "Calibri",
            }),
          ],
        })
    ),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  // --- Section content ---
  const sectionChildren: Paragraph[] = [];
  for (const section of sections) {
    sectionChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({ text: section.title, bold: true, size: 28 }),
        ],
      })
    );

    // Split content into paragraphs by newlines
    const contentParagraphs = (section.content ?? "").split("\n").filter(Boolean);
    for (const para of contentParagraphs) {
      sectionChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: para.trim(), size: 22, font: "Calibri" }),
          ],
        })
      );
    }
  }

  // --- Assemble document ---
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [...titlePageChildren, ...tocChildren, ...sectionChildren],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}
