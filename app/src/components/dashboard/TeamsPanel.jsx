const GROUPS = ["A", "B", "C"];

export default function TeamsPanel({ state }) {
  return (
    <div className="panel" style={{ flex: "none", width: "100%" }}>
      <div className="panel-head">PASUKAN & PEMAIN</div>
      <div className="standings-cols">
        {GROUPS.map((g) => (
          <div className="standings-col" key={g}>
            <div className="g">KUMPULAN {g}</div>
            {Object.values(state.teams)
              .filter((t) => t.group === g)
              .map((t) => (
                <div className="row" key={t.id}>
                  <span>{t.name}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="panel-note">
        Senarai pemain bagi setiap pasukan akan dikemas kini oleh urusetia sebelum hari
        perlawanan.
      </div>
    </div>
  );
}
