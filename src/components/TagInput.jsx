import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

// Generic free-text tag/chip input backed by a plain string array,
// used for highlightTags, qualityChips, materials, services, features, etc.
export default function TagInput({ label, value = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      inputValue={inputValue}
      onInputChange={(_e, newInput) => setInputValue(newInput)}
      onChange={(_e, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder || 'Type and press Enter'}
        />
      )}
    />
  );
}
