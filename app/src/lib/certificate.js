const WIDTH = 1600;
const HEIGHT = 1131;

// Always fall back to a generic sans-serif if the web font hasn't loaded
// (slow connection, blocked request, ad blocker) -- canvas text doesn't
// wait for web fonts the way DOM text does, so an unqualified family name
// can silently render in the browser's serif default instead.
const OSWALD = "Oswald, sans-serif";
const BARLOW = "Barlow, sans-serif";

async function ensureFontsReady() {
  try {
    await Promise.all([
      document.fonts.load(`700 72px ${OSWALD}`),
      document.fonts.load(`700 26px ${BARLOW}`),
      document.fonts.load(`600 30px ${BARLOW}`),
      document.fonts.load(`600 22px ${BARLOW}`),
      document.fonts.load(`500 26px ${BARLOW}`),
      document.fonts.load(`500 18px ${BARLOW}`),
    ]);
    await document.fonts.ready;
  } catch {
    // Proceed with whatever fonts are available -- the fallback in OSWALD/
    // BARLOW above still gives a reasonable-looking certificate.
  }
}

export async function generateCertificateBlob({ name, teamName }) {
  await ensureFontsReady();

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f4f2ec";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "#12291a";
  ctx.lineWidth = 10;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

  ctx.strokeStyle = "#e8b21e";
  ctx.lineWidth = 3;
  ctx.strokeRect(64, 64, WIDTH - 128, HEIGHT - 128);

  ctx.textAlign = "center";

  ctx.fillStyle = "#c4930e";
  ctx.font = `700 26px ${BARLOW}`;
  ctx.fillText("KEJOHANAN JEMPUTAN", WIDTH / 2, 190);

  ctx.fillStyle = "#12291a";
  ctx.font = `700 64px ${OSWALD}`;
  ctx.fillText("SIJIL PENYERTAAN", WIDTH / 2, 260);

  ctx.font = `600 30px ${BARLOW}`;
  ctx.fillText("PSKPP HOKI GURU PERAK 2026", WIDTH / 2, 305);

  ctx.strokeStyle = "#e8b21e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 80, 335);
  ctx.lineTo(WIDTH / 2 + 80, 335);
  ctx.stroke();

  ctx.fillStyle = "rgba(18,41,26,0.7)";
  ctx.font = `500 26px ${BARLOW}`;
  ctx.fillText("Sijil ini dengan sukacitanya dianugerahkan kepada", WIDTH / 2, 430);

  ctx.fillStyle = "#12291a";
  ctx.font = `700 72px ${OSWALD}`;
  ctx.fillText(name, WIDTH / 2, 530);

  const nameWidth = ctx.measureText(name).width;
  ctx.strokeStyle = "rgba(18,41,26,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - nameWidth / 2 - 20, 555);
  ctx.lineTo(WIDTH / 2 + nameWidth / 2 + 20, 555);
  ctx.stroke();

  ctx.fillStyle = "rgba(18,41,26,0.7)";
  ctx.font = `500 26px ${BARLOW}`;
  ctx.fillText(`daripada pasukan ${teamName}`, WIDTH / 2, 615);
  ctx.fillText(
    "atas penyertaan dalam Kejohanan Jemputan PSKPP Hoki Guru Perak 2026,",
    WIDTH / 2,
    660,
  );
  ctx.fillText("19-20 September 2026 · Padang Hoki USAS, Kuala Kangsar.", WIDTH / 2, 695);

  ctx.strokeStyle = "rgba(18,41,26,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 160, HEIGHT - 170);
  ctx.lineTo(WIDTH / 2 + 160, HEIGHT - 170);
  ctx.stroke();

  ctx.fillStyle = "#12291a";
  ctx.font = `600 22px ${BARLOW}`;
  ctx.fillText("Pengerusi, Jawatankuasa Pengelola", WIDTH / 2, HEIGHT - 140);

  ctx.fillStyle = "rgba(18,41,26,0.5)";
  ctx.font = `500 18px ${BARLOW}`;
  ctx.fillText("Kejohanan Jemputan PSKPP Hoki Guru Perak 2026", WIDTH / 2, HEIGHT - 112);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadCertificate({ name, teamName }) {
  const blob = await generateCertificateBlob({ name, teamName });
  downloadBlob(blob, `Sijil-${name.replace(/\s+/g, "_")}.png`);
}
