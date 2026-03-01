import React, { useState } from 'react';
import { Shield, FileText, BookOpen, HelpCircle, AlertCircle } from 'lucide-react';

const PrivacyAndTerms = () => {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'rules', label: 'Rules', icon: BookOpen },
    { id: 'instructions', label: 'Instructions', icon: AlertCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Privacy Policy</h2>
            <p className="text-gray-600">Last updated: March 1, 2026</p>
            
            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Information We Collect</h3>
                <p className="text-gray-700">
                  We collect information you provide directly to us, including your name, email address, 
                  phone number, blood type, and location information when you register for our blood donation platform.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <p className="text-gray-700 mb-2">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Connect blood donors with recipients</li>
                  <li>Send notifications about blood requests</li>
                  <li>Verify donor eligibility</li>
                  <li>Improve our services</li>
                  <li>Communicate with you about your account</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Information Sharing</h3>
                <p className="text-gray-700">
                  We share your information only with verified blood recipients and healthcare facilities 
                  when you choose to respond to a blood request. We never sell your personal information.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Data Security</h3>
                <p className="text-gray-700">
                  We implement appropriate security measures to protect your personal information from 
                  unauthorized access, alteration, or disclosure.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">5. Your Rights</h3>
                <p className="text-gray-700 mb-2">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your account</li>
                  <li>Opt-out of notifications</li>
                </ul>
              </section>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Terms of Service</h2>
            <p className="text-gray-600">Last updated: March 1, 2026</p>
            
            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p className="text-gray-700">
                  By accessing and using BloodConnect, you accept and agree to be bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Eligibility</h3>
                <p className="text-gray-700 mb-2">To use this platform, you must:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Be at least 18 years old</li>
                  <li>Meet blood donation eligibility criteria</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Have legal capacity to enter into binding agreements</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. User Responsibilities</h3>
                <p className="text-gray-700 mb-2">You agree to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Provide accurate health and contact information</li>
                  <li>Respond promptly to blood requests you accept</li>
                  <li>Follow medical guidelines for blood donation</li>
                  <li>Not misuse the platform or engage in fraudulent activities</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Medical Disclaimer</h3>
                <p className="text-gray-700">
                  BloodConnect is a connection platform only. We do not provide medical advice, diagnosis, 
                  or treatment. Always consult healthcare professionals for medical decisions.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">5. Limitation of Liability</h3>
                <p className="text-gray-700">
                  BloodConnect is not liable for any damages arising from the use of this platform, 
                  including but not limited to medical complications, delays in blood delivery, or 
                  inaccurate information provided by users.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">6. Termination</h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate accounts that violate these terms or 
                  engage in harmful behavior.
                </p>
              </section>
            </div>
          </div>
        );

      case 'rules':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Platform Rules</h2>
            
            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Donor Rules</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Must be between 18-65 years old</li>
                  <li>Minimum weight: 50 kg (110 lbs)</li>
                  <li>Must be in good health</li>
                  <li>Wait 3 months between whole blood donations</li>
                  <li>No recent tattoos or piercings (within 6 months)</li>
                  <li>Not pregnant or breastfeeding</li>
                  <li>No history of certain medical conditions (HIV, Hepatitis, etc.)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Rules</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide accurate blood type and quantity needed</li>
                  <li>Include valid hospital/clinic information</li>
                  <li>Specify urgency level honestly</li>
                  <li>Respond to donor inquiries promptly</li>
                  <li>Update request status when fulfilled</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Communication Rules</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Be respectful and professional</li>
                  <li>No harassment or abusive language</li>
                  <li>Protect personal information</li>
                  <li>Report suspicious activity</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Prohibited Activities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Selling or buying blood</li>
                  <li>Providing false medical information</li>
                  <li>Creating fake accounts</li>
                  <li>Spamming or soliciting</li>
                  <li>Sharing account credentials</li>
                </ul>
              </section>
            </div>
          </div>
        );

      case 'instructions':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">How to Use BloodConnect</h2>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Blood Donors</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Step 1: Register</h4>
                    <p className="text-blue-800">Create an account with your blood type and contact information.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Step 2: Browse Requests</h4>
                    <p className="text-blue-800">View blood requests in your area that match your blood type.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Step 3: Respond</h4>
                    <p className="text-blue-800">Click "Contact" to connect with the recipient and coordinate donation.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Step 4: Donate</h4>
                    <p className="text-blue-800">Visit the specified hospital/clinic to complete the donation.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Blood Recipients</h3>
                <div className="space-y-3">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-900 mb-2">Step 1: Create Request</h4>
                    <p className="text-red-800">Fill out the blood request form with required details.</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-900 mb-2">Step 2: Wait for Responses</h4>
                    <p className="text-red-800">Nearby donors will be notified and can respond to your request.</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-900 mb-2">Step 3: Coordinate</h4>
                    <p className="text-red-800">Use the messaging feature to coordinate with donors.</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-900 mb-2">Step 4: Update Status</h4>
                    <p className="text-red-800">Mark your request as fulfilled once you receive the blood.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Emergency Contacts</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                  <p className="text-yellow-900 font-bold mb-2">In case of medical emergency:</p>
                  <ul className="text-yellow-800 space-y-1">
                    <li>• Call 911 immediately</li>
                    <li>• Contact your nearest hospital</li>
                    <li>• Reach out to local blood banks</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Who can donate blood?</h3>
                <p className="text-gray-700">
                  Generally, healthy individuals aged 18-65, weighing at least 50kg, can donate blood. 
                  Specific eligibility criteria apply based on medical history and recent activities.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How often can I donate blood?</h3>
                <p className="text-gray-700">
                  You can donate whole blood every 3 months (12 weeks). Platelet donations can be made 
                  more frequently, up to 24 times per year.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Is blood donation safe?</h3>
                <p className="text-gray-700">
                  Yes, blood donation is very safe. Sterile, single-use equipment is used for each donor, 
                  eliminating any risk of infection.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How long does donation take?</h3>
                <p className="text-gray-700">
                  The actual blood donation takes about 10-15 minutes. Including registration, health screening, 
                  and refreshments, plan for about 45-60 minutes total.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">What should I do before donating?</h3>
                <p className="text-gray-700">
                  Eat a healthy meal, drink plenty of water, get adequate sleep, and bring a valid ID. 
                  Avoid fatty foods before donation.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Can I donate if I have a tattoo?</h3>
                <p className="text-gray-700">
                  You must wait 6 months after getting a tattoo or piercing before donating blood to ensure 
                  there's no risk of infection.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Is my information kept private?</h3>
                <p className="text-gray-700">
                  Yes, we take privacy seriously. Your information is only shared with verified recipients 
                  when you choose to respond to a blood request.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How do I know if a request is legitimate?</h3>
                <p className="text-gray-700">
                  All requests include hospital/clinic information. We recommend verifying with the healthcare 
                  facility before proceeding. Report any suspicious activity to our support team.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PrivacyAndTerms;
