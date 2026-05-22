import React from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({ placeholder = "Search...", defaultValue = "" }: SearchBarProps) {
  return (
    <div className={styles.headerSearch}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder={placeholder} defaultValue={defaultValue} />
    </div>
  );
}