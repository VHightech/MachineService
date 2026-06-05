import ExcelJS from "exceljs";
import { getPezziConMacchine } from "@/lib/queries";
import { isScortaBassa } from "@/lib/types";
import { styleHeader, xlsxResponse } from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const pezzi = await getPezziConMacchine();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Magazzino");
  ws.columns = [
    { header: "Codice", key: "codice", width: 16 },
    { header: "Descrizione", key: "nome", width: 34 },
    { header: "Giacenza", key: "quantita", width: 11 },
    { header: "Soglia minima", key: "minima", width: 14 },
    { header: "Esaurito", key: "esaurito", width: 12 },
    { header: "Scorta bassa", key: "bassa", width: 13 },
    { header: "Macchine compatibili", key: "macchine", width: 44 },
  ];

  for (const p of pezzi) {
    ws.addRow({
      codice: p.codice,
      nome: p.nome,
      quantita: p.quantita,
      minima: p.quantita_minima,
      esaurito: p.quantita === 0 ? "Sì" : "No",
      bassa: isScortaBassa(p) ? "Sì" : "No",
      macchine: p.macchine.map((m) => m.nome).join(", "),
    });
  }

  styleHeader(ws);
  return xlsxResponse(wb, "magazzino");
}
