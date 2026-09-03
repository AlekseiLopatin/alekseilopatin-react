import { useEffect, useState } from 'react';
import './OTPGenerator.css';

const OTP_LIFETIME = 5;

/* padStart нужен, потому что Math.random может дать, например, 4213 —
   а по заданию код всегда ровно шесть цифр, включая ведущие нули. */
const createOtp = () =>
  String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

export const OTPGenerator = () => {
  const [otp, setOtp] = useState('');
  /* null = отсчёт ещё ни разу не запускали, поэтому строку таймера
     надо оставить пустой; 0 = код истёк. Булевого флага тут не хватило бы. */
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft === 0) return;

    const timeoutId = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [secondsLeft]);

  const handleGenerate = () => {
    setOtp(createOtp());
    setSecondsLeft(OTP_LIFETIME);
  };

  const isCountingDown = secondsLeft !== null && secondsLeft > 0;

  let timerMessage = '';
  if (secondsLeft !== null) {
    timerMessage = isCountingDown
      ? `Expires in: ${secondsLeft} seconds`
      : 'OTP expired. Click the button to generate a new OTP.';
  }

  return (
    <div className="container">
      <h1 id="otp-title">OTP Generator</h1>

      <h2 id="otp-display" className={otp ? 'otp-code' : 'otp-hint'}>
        {otp || "Click 'Generate OTP' to get a code"}
      </h2>

      {/* aria-live="polite" — скринридер зачитает смену секунд,
          не перебивая то, что пользователь слушает сейчас. */}
      <p id="otp-timer" aria-live="polite" className="otp-timer">
        {timerMessage}
      </p>

      <button
        id="generate-otp-button"
        type="button"
        onClick={handleGenerate}
        disabled={isCountingDown}
      >
        Generate OTP
      </button>
    </div>
  );
};

export default OTPGenerator;
