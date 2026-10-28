import React from "react";

const OIL_TYPES = [
  { value: "Sarso Khalli", label: "Sarso Khalli" },
  { value: "Tilli Khalli", label: "Tilli Khalli" },
];

export default function KhalliTypeSelect({ value, onChange }) {
  return (
    <div className="mb-3">
      <label className="form-label">Type</label>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {OIL_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
