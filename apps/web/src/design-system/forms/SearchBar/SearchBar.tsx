import React from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import styles from './SearchBar.module.css';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  className?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <div className={clsx(styles.container, className)}>
        <Search className={styles.icon} size={20} />
        <input
          ref={ref}
          type="search"
          className={styles.input}
          placeholder="Search..."
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
SearchBar.displayName = 'SearchBar';
