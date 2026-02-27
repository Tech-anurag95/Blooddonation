import React from 'react';

const Instructions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Donor Instructions & Guidance</h1>

      <section className="mb-4">
        <h2 className="font-semibold">Before Donation</h2>
        <ul className="list-disc list-inside">
          <li>Eat a healthy, iron-rich meal 2–3 hours before donating.</li>
          <li>Drink plenty of fluids to stay hydrated.</li>
          <li>Avoid heavy alcohol intake 24 hours before donation.</li>
          <li>Bring a valid ID and details of any medical conditions or medications.</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">During Donation</h2>
        <p>Donation usually takes 10–15 minutes for whole blood; the full visit (screening, donation, recovery) takes about 45–60 minutes. Follow staff instructions and notify them of any discomfort.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">After Donation</h2>
        <ul className="list-disc list-inside">
          <li>Rest for a few minutes and have the provided refreshments.</li>
          <li>Keep the bandage on for at least 4–6 hours and avoid heavy lifting with the arm used.</li>
          <li>Drink extra fluids and eat iron-rich foods (meat, beans, leafy greens) to replenish iron stores.</li>
          <li>If you feel faint or dizzy, lie down and raise your legs; seek medical help if symptoms persist.</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Safety & Ethics</h2>
        <p>Donation is voluntary and unpaid. One unit of blood can be separated into components to help multiple patients.</p>
      </section>
    </div>
  );
};

export default Instructions;
