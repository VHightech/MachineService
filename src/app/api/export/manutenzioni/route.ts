import ExcelJS from "exceljs";
import { getManutenzioniComplete } from "@/lib/queries";
import { formatDataIt } from "@/lib/utils";
import { styleHeader, xlsxResponse } from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const manutenzioni = await getManutenzioniComplete();

  const wb = new ExcelJS.Workbook();

  // Foglio 1: una riga per intervento
  const ws = wb.addWorksheet("Manutenzioni");
  ws.columns = [
    { header: "Data", key: "data", width: 13 },
    { header: "Macchina", key: "macchina", width: 26 },
    { header: "Tecnico", key: "tecnico", width: 20 },
    { header: "Descrizione", key: "descrizione", width: 50 },
    { header: "N. pezzi", key: "npezzi", width: 10 },
    { header: "Pezzi utilizzati", key: "pezzi", width: 50 },
  ];

  for (const m of manutenzioni) {
    ws.addRow({
      data: formatDataIt(m.data),
      macchina: m.macchina?.nome ?? "Macchina rimossa",
      tecnico: m.tecnico ?? "",
      descrizione: m.descrizione,
      npezzi: m.pezzi.reduce((s, p) => s + p.quantita_usata, 0),
      pezzi: m.pezzi
        .map((p) => `${p.pezzo_codice} ${p.pezzo_nome} ×${p.quantita_usata}`)
        .join("; "),
    });
  }
  ws.getColumn("descrizione").alignment = { wrapText: true, vertical: "top" };
  ws.getColumn("pezzi").alignment = { wrapText: true, vertical: "top" };
  styleHeader(ws);

  // Foglio 2: una riga per ogni pezzo usato (dettaglio)
  const wd = wb.addWorksheet("Dettaglio pezzi");
  wd.columns = [
    { header: "Data", key: "data", width: 13 },
    { header: "Macchina", key: "macchina", width: 26 },
    { header: "Codice pezzo", key: "codice", width: 16 },
    { header: "Nome pezzo", key: "nome", width: 34 },
    { header: "Quantità usata", key: "qta", width: 14 },
  ];
  for (const m of manutenzioni) {
    for (const p of m.pezzi) {
      wd.addRow({
        data: formatDataIt(m.data),
        macchina: m.macchina?.nome ?? "Macchina rimossa",
        codice: p.pezzo_codice,
        nome: p.pezzo_nome,
        qta: p.quantita_usata,
      });
    }
  }
  styleHeader(wd);

  return xlsxResponse(wb, "manutenzioni");
}
