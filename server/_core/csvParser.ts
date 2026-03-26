/**
 * CSV Parser for bulk importing professors and bolsistas
 */

export interface ParsedRow {
  nome: string;
  email: string;
}

export interface ParseResult {
  success: boolean;
  data: ParsedRow[];
  errors: ParseError[];
  totalRows: number;
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parses CSV content and validates data
 * Expected format: nome,email (with header row)
 */
export function parseCSV(csvContent: string): ParseResult {
  const errors: ParseError[] = [];
  const data: ParsedRow[] = [];

  try {
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: "file",
            message: "Arquivo vazio ou sem dados",
          },
        ],
        totalRows: 0,
      };
    }

    // Parse header
    const headerLine = lines[0].trim();
    const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

    const nomeIndex = headers.indexOf("nome");
    const emailIndex = headers.indexOf("email");

    if (nomeIndex === -1 || emailIndex === -1) {
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: "header",
            message:
              "Cabeçalho inválido. Esperado: nome,email",
          },
        ],
        totalRows: 0,
      };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());

      if (values.length < 2) {
        errors.push({
          row: i + 1,
          field: "format",
          message: "Linha com formato inválido",
        });
        continue;
      }

      const nome = values[nomeIndex]?.trim() || "";
      const email = values[emailIndex]?.trim() || "";

      // Validate nome
      if (!nome) {
        errors.push({
          row: i + 1,
          field: "nome",
          message: "Nome é obrigatório",
        });
        continue;
      }

      // Validate email
      if (!email) {
        errors.push({
          row: i + 1,
          field: "email",
          message: "Email é obrigatório",
        });
        continue;
      }

      if (!isValidEmail(email)) {
        errors.push({
          row: i + 1,
          field: "email",
          message: `Email inválido: ${email}`,
        });
        continue;
      }

      // Check for duplicates within the file
      if (data.some((d) => d.email.toLowerCase() === email.toLowerCase())) {
        errors.push({
          row: i + 1,
          field: "email",
          message: `Email duplicado no arquivo: ${email}`,
        });
        continue;
      }

      data.push({ nome, email });
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      totalRows: lines.length - 1, // Exclude header
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [
        {
          row: 0,
          field: "parse",
          message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        },
      ],
      totalRows: 0,
    };
  }
}

/**
 * Converts file to text
 */
export async function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Falha ao ler arquivo"));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}
