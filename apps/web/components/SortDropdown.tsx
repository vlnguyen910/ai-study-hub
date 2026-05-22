"use client";

import React, { useState } from "react";
import styles from "./SortDropdown.module.css";

const SORT_OPTIONS = ["Mới nhất", "Tải xuống nhiều nhất", "Đánh giá cao nhất"];

export default function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(SORT_OPTIONS[0]);

  return (
    <div className={styles.dropdownContainer}>
      <span className={styles.label}>Sắp xếp:</span>
      <div className={styles.dropdown} onClick={() => setIsOpen(!isOpen)}>
        <strong className={styles.selected}>{selected}</strong>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>

        {isOpen && (
          <div className={styles.menu}>
            {SORT_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={styles.menuItem}
                onClick={() => {
                  setSelected(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
