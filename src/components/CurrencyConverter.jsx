import { useEffect, useMemo, useState } from 'react';
import { CURRENCY_CODES, FALLBACK_RATES } from '../data/currencies';
import { CurrencySelect } from './CurrencySelect';
import './CurrencyConverter.css';

const API = 'https://open.er-api.com/v6/latest/USD';

export const CurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');

  const [rates, setRates] = useState(FALLBACK_RATES);
  const [status, setStatus] = useState('loading'); // loading | live | offline
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    /* AbortController отменяет запрос, если компонент размонтируется
       раньше ответа — иначе setState улетит в пустоту. */
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(API, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.result !== 'success') throw new Error('API error');

        /* API отдаёт 166 валют — оставляем только те, что есть
           в нашем кураторском списке, иначе селект не пролистать. */
        const filtered = Object.fromEntries(
          CURRENCY_CODES.filter((code) => data.rates[code] != null).map(
            (code) => [code, data.rates[code]],
          ),
        );

        setRates(filtered);
        setUpdatedAt(data.time_last_update_utc?.slice(5, 16));
        setStatus('live');
      } catch (error) {
        if (error.name === 'AbortError') return;
        setStatus('offline'); // остаёмся на запасной таблице
      }
    };

    load();
    return () => controller.abort();
  }, []);

  /* Считаем сумму сразу во ВСЕХ валютах и запоминаем результат.
     Валюты "to" в зависимостях нет: её смена достаёт готовое
     значение из объекта, а не запускает пересчёт заново. */
  const convertedAmounts = useMemo(() => {
    const inUsd = Number(amount) / rates[from];

    return Object.fromEntries(
      Object.entries(rates).map(([code, rate]) => [code, inUsd * rate]),
    );
  }, [amount, from, rates]);

  /* Порядок из CURRENCY_META, а не алфавитный: доллар и евро
     нужны чаще, чем аргентинское песо, и должны быть сверху. */
  const codes = useMemo(
    () => CURRENCY_CODES.filter((code) => rates[code] != null),
    [rates],
  );

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const result = convertedAmounts[to] ?? 0;
  const rate = (rates[to] / rates[from]).toFixed(4);


  return (
    <div className="converter">
      <label htmlFor="converter-amount">Amount</label>
      <input
        id="converter-amount"
        type="number"
        min="0"
        step="any"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />

      <div className="converter-pair">
        <CurrencySelect
          id="converter-from"
          label="From"
          value={from}
          codes={codes}
          onChange={setFrom}
        />

        <button
          type="button"
          className="converter-swap"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>

        <CurrencySelect
          id="converter-to"
          label="To"
          value={to}
          codes={codes}
          onChange={setTo}
        />
      </div>

      <output className="converter-result">
        {result.toFixed(2)} {to}
      </output>

      <p className="converter-rate">
        1 {from} = {rate} {to}
      </p>

      <p className={`converter-status is-${status}`}>
        {status === 'loading' && 'Loading live rates…'}
        {status === 'live' && `Live rates · ${updatedAt}`}
        {status === 'offline' &&
          'Offline — using approximate stored rates'}
      </p>
    </div>
  );
};

export default CurrencyConverter;
