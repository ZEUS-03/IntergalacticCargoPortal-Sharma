import React, { useMemo } from "react";
import sortCargo from "../utils/sortCargo";

const KG_TO_LBS = 2.20462;

export default function CargoTable({ cargo, role }) {
  const sortedCargo = useMemo(() => sortCargo(cargo || []), [cargo]);
  const isAdmin = role === "admin";

  return (
    <div className="table-shell">
      <table className="cargo-table">
        <thead>
          <tr>
            <th>Cargo ID</th>
            <th>Destination</th>
            <th>{isAdmin ? "Weight (KG)" : "Weight (LBS)"}</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedCargo.map((item) => (
            <tr key={item.id}>
              <td>{item.cargo_id}</td>
              <td>{item.destination}</td>
              <td>
                {isAdmin
                  ? item.weight_kg
                  : (Number(item.weight_kg) * KG_TO_LBS).toFixed(2)}
              </td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
