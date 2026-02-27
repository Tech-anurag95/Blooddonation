import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">We take your privacy seriously. This app stores minimal personal and health-related data required to match donors and recipients. Data is not sold. For production use, update this policy with legal review.</p>
      <h2 className="font-semibold">Data Collected</h2>
      <ul className="list-disc list-inside">
        <li>Contact information (name, email, phone)</li>
        <li>Basic health information relevant to donation eligibility</li>
        <li>Verification documents when provided</li>
      </ul>
    </div>
  );
};

export default Privacy;
