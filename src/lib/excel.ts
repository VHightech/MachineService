import "server-only";
import ExcelJS from "exceljs";

/** Stile coerente per l'intestazione di un foglio (grassetto + sfondo lime). */
export function styleHeader(ws: ExcelJS.Worksheet): void {
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FF1B1B17" } };
  header.height = 22;
  header.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEF7CD" },
    };
    cell.alignment = { vertical: "middle" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFE9E8E0" } } };
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

/** Costruisce la Response di download per un workbook .xlsx. */
export async function xlsxResponse(
  wb: ExcelJS.Workbook,
  baseName: string,
): Promise<Response> {
  const data = await wb.xlsx.writeBuffer();
  const oggi = new Date().toISOString().slice(0, 10);
  return new Response(data as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${baseName}_${oggi}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
