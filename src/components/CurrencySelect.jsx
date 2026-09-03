import { useEffect, useMemo, useRef, useState } from 'react';
import { CURRENCY_META, flagSrc } from '../data/currencies';
import './CurrencySelect.css';

/* Нативный <select> не умеет содержать поле поиска, поэтому
   собираем комбобокс руками: кнопка с текущей валютой плюс
   выпадающая панель со строкой поиска и отфильтрованным списком. */
export const CurrencySelect = ({ id, label, value, codes, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  /* Фильтрация мемоизирована: пересчитывается только когда
     меняется список валют или сам запрос, а не на каждый
     повторный рендер родителя (например, при вводе суммы). */
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return codes;

    return codes.filter((code) => {
      const name = CURRENCY_META[code]?.name ?? '';
      return (
        code.toLowerCase().includes(needle) ||
        name.toLowerCase().includes(needle)
      );
    });
  }, [codes, query]);

  /* Закрываем по клику снаружи и по Escape — иначе панель
     остаётся висеть поверх страницы. */
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    searchRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const select = (code) => {
    onChange(code);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="currency-select" ref={rootRef}>
      <span className="currency-select-label" id={`${id}-label`}>
        {label}
      </span>

      <button
        type="button"
        id={id}
        className="currency-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}`}
      >
        <img className="flag" src={flagSrc(value)} alt="" width="20" />
        <span className="currency-select-code">{value}</span>
        <span className="currency-select-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="currency-select-panel">
          <input
            ref={searchRef}
            type="search"
            className="currency-select-search"
            placeholder="Search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={`${label} — search`}
          />

          {filtered.length === 0 ? (
            <p className="currency-select-empty">No match</p>
          ) : (
            <ul className="currency-select-list" role="listbox">
              {filtered.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={code === value}
                    className={
                      code === value
                        ? 'currency-option is-selected'
                        : 'currency-option'
                    }
                    onClick={() => select(code)}
                  >
                    <img className="flag" src={flagSrc(code)} alt="" width="20" />
                    <span className="currency-select-code">{code}</span>
                    <span className="currency-option-name">
                      {CURRENCY_META[code]?.name ?? code}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;
