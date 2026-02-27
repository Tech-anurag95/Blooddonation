import React from 'react';

const FAQ = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>

      <section className="mb-4">
        <h2 className="font-semibold">Who can donate blood?</h2>
        <p>Eligible donors are generally healthy adults between 18 and 65 years meeting weight and health criteria. See the Rules page for full eligibility.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">How long does donation take?</h2>
        <p>The process takes about 45–60 minutes including screening and recovery. The actual blood draw is ~10–15 minutes.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Is donation safe?</h2>
        <p>Yes — donation is safe when performed by trained staff using sterile equipment. Donors are monitored and advised to rest after donating.</p>
      </section>
    </div>
  );
};

export default FAQ;
