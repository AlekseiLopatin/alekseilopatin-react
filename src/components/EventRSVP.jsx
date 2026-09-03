import { useState } from 'react';
import './EventRSVP.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  attendees: 1,
  dietary: '',
  guests: false,
};

export const EventRSVP = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  /* null = форму ещё не отправляли, поэтому подтверждения нет.
     После отправки сюда ложится снимок данных, а не сама форма,
     чтобы правки в полях не переписывали уже показанный ответ. */
  const [submitted, setSubmitted] = useState(null);

  /* Один обработчик на все поля: имя поля берём из name,
     а у чекбокса значение лежит в checked, а не в value. */
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // без этого страница перезагрузится
    setSubmitted(form);
  };

  return (
    <div className="rsvp">
      <h2 className="rsvp-title">Event RSVP</h2>

      <form className="rsvp-form" onSubmit={handleSubmit}>
        <label htmlFor="rsvp-name">Name</label>
        <input
          id="rsvp-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="rsvp-email">Email</label>
        <input
          id="rsvp-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="rsvp-attendees">Number of attendees</label>
        <input
          id="rsvp-attendees"
          name="attendees"
          type="number"
          min="1"
          value={form.attendees}
          onChange={handleChange}
          required
        />

        <label htmlFor="rsvp-dietary">Dietary preferences (optional)</label>
        <input
          id="rsvp-dietary"
          name="dietary"
          type="text"
          value={form.dietary}
          onChange={handleChange}
        />

        <label className="rsvp-checkbox" htmlFor="rsvp-guests">
          <input
            id="rsvp-guests"
            name="guests"
            type="checkbox"
            checked={form.guests}
            onChange={handleChange}
          />
          Bringing additional guests
        </label>

        <button type="submit">Send RSVP</button>
      </form>

      {submitted && (
        <div className="rsvp-confirmation">
          <h3>RSVP Submitted!</h3>
          <p>Name: {submitted.name}</p>
          <p>Email: {submitted.email}</p>
          <p>Number of attendees: {submitted.attendees}</p>
          <p>Dietary preferences: {submitted.dietary || 'None'}</p>
          <p>Bringing additional guests: {submitted.guests ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default EventRSVP;
