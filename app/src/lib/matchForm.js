// Generates the official "Borang Perlawanan" (match report form) as a
// downloadable .xlsx, replicating the layout of the organiser-supplied
// BORANG_PERLAWANAN.xls template: title block, match info, team names,
// a pre-filled player roster (jersey no. + name) per side, and blank
// space for everything decided on the pitch (time-on, cards, score,
// event log, remarks, officials' signatures) for hand-filling on paper.
import ExcelJS from "exceljs";
import { allMatchesWithList } from "./matches";
import { teamName } from "./format";

const ROSTER_SLOTS = 18;
const TOTAL_COLS = 27;

const COL_WIDTHS = [
  2.27, 4.0, 2.27, 2.27, 3.27, 3.27, 3.27, 3.27, 3.27, 6.0, 4.82, 4.82, 4.82, 1.82, 2.27, 2.54,
  2.27, 2.27, 3.27, 3.27, 3.27, 3.27, 4.54, 4.18, 4.73, 4.73, 4.63,
];

const THIN = { style: "thin" };
const BOX = { top: THIN, left: THIN, bottom: THIN, right: THIN };

const DAY_DATE = { sat: "19-Sep-2026", sun: "20-Sep-2026" };

function merge(ws, r0, r1, c0, c1) {
  ws.mergeCells(r0 + 1, c0 + 1, r1, c1);
}

function cell(ws, r0, c0, value, { size = 8, bold = false, align = "center", border } = {}) {
  const c = ws.getCell(r0 + 1, c0 + 1);
  c.value = value;
  c.font = { name: "Arial", size, bold };
  c.alignment = { horizontal: align, vertical: "middle", wrapText: true };
  if (border) c.border = border;
  return c;
}

function rowHeight(ws, r0, pt) {
  ws.getRow(r0 + 1).height = pt;
}

function gameNumber(state, matchId) {
  const order = allMatchesWithList(state).map(({ m }) => m.id);
  return order.indexOf(matchId) + 1;
}

function sortedRoster(players, teamId) {
  return players
    .filter((p) => p.team_id === teamId)
    .sort((a, b) => (a.jersey_number ?? 999) - (b.jersey_number ?? 999) || a.name.localeCompare(b.name))
    .slice(0, ROSTER_SLOTS);
}

function buildRosterHalf(ws, r0, colStart, roster) {
  // colStart..colStart+13: Time-on(2) | No.Jersi(2) | Nama(6) | H | K | M
  const timeOn = colStart;
  const jersi = colStart + 2;
  const namaStart = colStart + 4;
  const namaEnd = colStart + 10;
  const h = colStart + 10;
  const k = colStart + 11;
  const m = colStart + 12;

  merge(ws, r0, r0 + 1, timeOn, jersi);
  cell(ws, r0, timeOn, "", { border: BOX });
  merge(ws, r0, r0 + 1, jersi, namaStart);
  const p = roster[r0 - 12];
  cell(ws, r0, jersi, p?.jersey_number ?? "", { border: BOX, size: 9 });
  cell(ws, r0, namaStart, p?.name ?? "", { align: "left", size: 9 });
  for (let cc = namaStart + 1; cc < namaEnd; cc++) cell(ws, r0, cc, "");
  cell(ws, r0, h, "", { border: BOX });
  cell(ws, r0, k, "", { border: BOX });
  cell(ws, r0, m, "", { border: BOX });
}

function fillGameSheet(ws, { number, dateStr, time, groupLabel, teamAName, teamBName, rosterA, rosterB }) {
  ws.columns = COL_WIDTHS.map((width) => ({ width }));

  merge(ws, 0, 1, 0, TOTAL_COLS);
  cell(ws, 0, 0, "KEJOHANAN JEMPUTAN LIGA", { size: 13 });
  merge(ws, 1, 2, 0, TOTAL_COLS);
  cell(ws, 1, 0, "HOKI GURU PERAK 2026", { size: 12, bold: true });
  merge(ws, 2, 3, 0, TOTAL_COLS);
  cell(ws, 2, 0, groupLabel, { size: 12 });
  merge(ws, 3, 4, 0, TOTAL_COLS);
  cell(ws, 3, 0, "LAPORAN PERLAWANAN", { size: 14, bold: true });
  rowHeight(ws, 0, 16.5);
  rowHeight(ws, 1, 15.5);
  rowHeight(ws, 2, 15.5);
  rowHeight(ws, 3, 18);
  rowHeight(ws, 4, 6.75);

  merge(ws, 5, 6, 6, 9);
  cell(ws, 5, 6, "Match. No");
  cell(ws, 5, 9, number, { bold: true });
  merge(ws, 5, 6, 10, 12);
  cell(ws, 5, 10, "Tarikh");
  merge(ws, 5, 6, 12, 15);
  cell(ws, 5, 12, dateStr);
  cell(ws, 5, 16, "Masa", { align: "left" });
  merge(ws, 5, 6, 19, 22);
  cell(ws, 5, 19, time);
  merge(ws, 5, 6, 22, 24);
  cell(ws, 5, 22, "Venue");
  merge(ws, 5, 6, 24, 27);
  cell(ws, 5, 24, "USAS");
  rowHeight(ws, 5, 15);
  rowHeight(ws, 6, 3.75);

  merge(ws, 7, 8, 0, 10);
  cell(ws, 7, 0, "PASUKAN", { bold: true, size: 11 });
  merge(ws, 7, 8, 10, 13);
  cell(ws, 7, 10, "FINAL", { size: 8 });
  cell(ws, 7, 15, "", { border: { bottom: THIN } });
  merge(ws, 7, 8, 18, 27);
  cell(ws, 7, 18, "PASUKAN", { bold: true, size: 11 });

  merge(ws, 8, 11, 0, 10);
  cell(ws, 8, 0, teamAName.toUpperCase(), { bold: true, size: 11 });
  merge(ws, 8, 9, 10, 13);
  cell(ws, 8, 10, "HALF-TIME", { size: 8 });
  cell(ws, 8, 15, "", { border: { bottom: THIN } });
  merge(ws, 8, 11, 18, 27);
  cell(ws, 8, 18, teamBName.toUpperCase(), { bold: true, size: 11 });

  merge(ws, 9, 10, 10, 13);
  cell(ws, 9, 10, "EXTRA TIME", { size: 8 });
  cell(ws, 9, 15, "", { border: { bottom: THIN } });

  merge(ws, 10, 11, 10, 13);
  cell(ws, 10, 10, "PENALTY STROKE", { size: 8 });
  cell(ws, 10, 15, "", { border: { bottom: THIN } });

  rowHeight(ws, 7, 12);
  rowHeight(ws, 8, 12);
  rowHeight(ws, 9, 11.25);
  rowHeight(ws, 10, 17.25);

  merge(ws, 11, 12, 0, 2);
  cell(ws, 11, 0, "Time on", { size: 8 });
  merge(ws, 11, 12, 2, 4);
  cell(ws, 11, 2, "No. Jersi", { size: 8 });
  merge(ws, 11, 12, 4, 10);
  cell(ws, 11, 4, "Nama Pemain", { size: 8 });
  cell(ws, 11, 10, "H", { size: 8 });
  cell(ws, 11, 11, "K", { size: 8 });
  cell(ws, 11, 12, "M", { size: 8 });
  merge(ws, 11, 12, 14, 16);
  cell(ws, 11, 14, "Time-on", { size: 8 });
  merge(ws, 11, 12, 16, 18);
  cell(ws, 11, 16, "No. Jersi", { size: 8 });
  merge(ws, 11, 12, 18, 24);
  cell(ws, 11, 18, "Nama Pemain", { size: 8 });
  cell(ws, 11, 24, "H", { size: 8 });
  cell(ws, 11, 25, "K", { size: 8 });
  cell(ws, 11, 26, "M", { size: 8 });
  rowHeight(ws, 11, 23.25);

  for (let i = 0; i < ROSTER_SLOTS; i++) {
    const r0 = 12 + i;
    buildRosterHalf(ws, r0, 0, rosterA);
    buildRosterHalf(ws, r0, 14, rosterB);
    rowHeight(ws, r0, 18);
  }

  cell(ws, 30, 0, "Pengurus Pasukan:", { align: "left" });
  cell(ws, 30, 14, "Pengurus Pasukan:", { align: "left" });
  rowHeight(ws, 30, 24);

  merge(ws, 31, 32, 0, 5);
  cell(ws, 31, 0, "Pengadil:", { align: "left" });
  merge(ws, 31, 32, 14, 20);
  cell(ws, 31, 14, "Pengadil:", { align: "left" });
  rowHeight(ws, 31, 24);

  merge(ws, 32, 33, 0, 5);
  cell(ws, 32, 0, "Hakim:", { align: "left" });
  merge(ws, 32, 33, 14, 20);
  cell(ws, 32, 14, "Hakim:", { align: "left" });
  rowHeight(ws, 32, 24);

  merge(ws, 33, 34, 0, 5);
  cell(ws, 33, 0, "Pegawai Teknikal:", { align: "left" });
  cell(ws, 33, 14, "Pengadil Simpanan:", { align: "left" });
  rowHeight(ws, 33, 24);
  rowHeight(ws, 34, 13.5);

  const blocks = [
    [0, 2, 4, 5, 7, 9],
    [9, 11, 13, 14, 16, 18],
    [18, 20, 22, 23, 25, 27],
  ];
  blocks.forEach(([pStart, pEnd, noCol, aStart, aEnd, sEnd]) => {
    merge(ws, 35, 36, pStart, pEnd);
    cell(ws, 35, pStart, "Pasukan", { size: 7 });
    merge(ws, 35, 36, pEnd, noCol);
    cell(ws, 35, pEnd, "Minit", { size: 7 });
    cell(ws, 35, noCol, "No.", { size: 7 });
    merge(ws, 35, 36, aStart, aEnd);
    cell(ws, 35, aStart, "Aksi", { size: 7 });
    merge(ws, 35, 36, aEnd, sEnd);
    cell(ws, 35, aEnd, "Skor", { size: 7 });
  });
  rowHeight(ws, 35, 18);

  for (let i = 0; i < 5; i++) {
    const r0 = 36 + i;
    blocks.forEach(([pStart, pEnd, noCol, aStart, aEnd, sEnd]) => {
      merge(ws, r0, r0 + 1, pStart, pEnd);
      cell(ws, r0, pStart, "", { border: BOX });
      merge(ws, r0, r0 + 1, pEnd, noCol);
      cell(ws, r0, pEnd, "", { border: BOX });
      cell(ws, r0, noCol, "", { border: BOX });
      merge(ws, r0, r0 + 1, aStart, aEnd);
      cell(ws, r0, aStart, "", { border: BOX });
      merge(ws, r0, r0 + 1, aEnd, sEnd);
      cell(ws, r0, aEnd, "", { border: BOX });
    });
    rowHeight(ws, r0, 18);
  }

  merge(ws, 41, 42, 0, TOTAL_COLS);
  cell(ws, 41, 0, "FG - FIELD GOAL / PC - PENALTY CORNER / PS - PENALTY STROKE", {
    size: 6,
    align: "left",
  });
  rowHeight(ws, 41, 12.5);

  merge(ws, 42, 45, 0, TOTAL_COLS);
  cell(ws, 42, 0, "REMARKS   :  ", { size: 8, align: "left" });
  rowHeight(ws, 42, 12.5);
  rowHeight(ws, 43, 12.5);
  rowHeight(ws, 44, 12.5);

  ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 1 };
}

function matchSheetData(state, m, players) {
  const number = gameNumber(state, m.id);
  const dateStr = DAY_DATE[m.day] ?? "";
  const groupLabel =
    m.phase === "final"
      ? "PERLAWANAN AKHIR"
      : m.phase === "third"
        ? "PERLAWANAN TEMPAT KE-3/4"
        : m.phase === "xy"
          ? `PERINGKAT ${m.group}`
          : `KUMPULAN ${m.group}`;
  return {
    number,
    dateStr,
    time: m.time,
    groupLabel,
    teamAName: teamName(state.teams, m.teamA),
    teamBName: teamName(state.teams, m.teamB),
    rosterA: m.teamA ? sortedRoster(players, m.teamA) : [],
    rosterB: m.teamB ? sortedRoster(players, m.teamB) : [],
  };
}

function safeSheetName(name) {
  return name.replace(/[*?:/\\[\]]/g, "").slice(0, 31);
}

export async function generateMatchFormWorkbook(state, m, players) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(safeSheetName(`GAME ${gameNumber(state, m.id)}`));
  fillGameSheet(ws, matchSheetData(state, m, players));
  return workbook;
}

export async function generateAllMatchFormsWorkbook(state, players) {
  const workbook = new ExcelJS.Workbook();
  const all = allMatchesWithList(state).filter(({ m }) => m.teamA && m.teamB);
  all.forEach(({ m }) => {
    const ws = workbook.addWorksheet(safeSheetName(`GAME ${gameNumber(state, m.id)}`));
    fillGameSheet(ws, matchSheetData(state, m, players));
  });
  return workbook;
}

export async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function matchFormFilename(state, m) {
  const a = teamName(state.teams, m.teamA);
  const b = teamName(state.teams, m.teamB);
  return `Borang Perlawanan - Game ${gameNumber(state, m.id)} - ${a} vs ${b}.xlsx`;
}
