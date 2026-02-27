import React from 'react';

const Rules = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">General Eligibility Criteria for Blood Donation (India)</h1>

      <section className="mb-4">
        <h2 className="font-semibold">Age</h2>
        <p>Must be between 18 and 65 years. Regular donors over 65 may be accepted at the discretion of a physician.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Weight</h2>
        <p>Minimum 45 kg for whole blood donation. For apheresis (platelet or plasma donation), the minimum is 50 kg.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Health Status</h2>
        <p>Donor must be in good general health, mentally alert, and physically fit. Must not have any acute illness such as cold, flu, fever, sore throat, or stomach bug.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Haemoglobin Level</h2>
        <p>Must be at least 12.5 g/dL (measured at the donation site).</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Vital Signs</h2>
        <p>Normal pulse (50–100 beats per minute), normal blood pressure (systolic 100–180 mm Hg, diastolic 50–100 mm Hg), and normal body temperature (≤37.5°C).</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Recent Medical History</h2>
        <ul className="list-disc list-inside">
          <li>No history of HIV, hepatitis B or C, tuberculosis, leprosy, epilepsy, cancer, heart disease, or bleeding disorders.</li>
          <li>No recent surgeries or major dental procedures (wait 3 days after minor dental work, 1 month after major procedures).</li>
          <li>No tattoo, piercing, or acupuncture in the past 12 months (or 12 hours if performed by a registered professional and inflammation has resolved).</li>
          <li>No rabies vaccination in the past 1 year.</li>
          <li>No malaria treatment in the past 3 months (or 3 years if from endemic areas).</li>
          <li>No immunization in the past 1 month (except for inactivated vaccines).</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Medications</h2>
        <p>Must not be on medication that could affect donor or recipient safety. Insulin-treated diabetics are ineligible; those controlled by diet or oral medication may donate.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Pregnancy &amp; Lactation</h2>
        <p>Women must wait at least 6 months after delivery and 1 year after childbirth before donating. Not allowed during pregnancy or while breastfeeding.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Donation Interval</h2>
        <p>Whole blood: Every 3 months for males, every 4 months for females. Apheresis (platelets/plasma): At least 48 hours between donations. Maximum 24 donations per year, not more than 2 per week.</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Deferrals</h2>
        <p>Temporary deferral applies for recent infections, vaccinations, travel to malaria-endemic areas, or minor procedures. Permanent deferral applies for HIV, hepatitis B/C, active cancer, heart disease, or history of blood transfusion-related complications.</p>
      </section>
    </div>
  );
};

export default Rules;
