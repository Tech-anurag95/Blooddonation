import React from 'react';
import { Heart, MapPin, Clock, Users } from 'lucide-react';

const BloodGroupCard = ({ group, donors }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
      <div className="text-4xl font-bold text-red-600 mb-2">{group}</div>
      <div className="flex items-center text-gray-600 space-x-2">
        <Users size={18} />
        <span>{donors} Donors Available</span>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition">
      <div className="text-4xl text-red-600 mb-4 flex justify-center">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Save Lives Through Blood Donation
              </h1>
              <p className="text-xl mb-8 text-red-100">
                Connect with nearby blood donors in minutes. In emergency? Find available donors instantly.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition">
                  Need Blood Now?
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-red-600 transition">
                  Become a Donor
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-6xl">🏥</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Groups Available */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">Available Blood Groups</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((group, idx) => (
              <BloodGroupCard key={group} group={group} donors={Math.floor(Math.random() * 50) + 10} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Choose BloodConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={MapPin}
              title="Find Nearby Donors"
              description="Locate available blood donors in your vicinity instantly using our geolocation feature."
            />
            <FeatureCard
              icon={Clock}
              title="Real-Time Updates"
              description="Get instant notifications when donors are available matching your blood type."
            />
            <FeatureCard
              icon={Heart}
              title="Safe & Verified"
              description="All donors are verified and follow strict health and safety guidelines."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: 'Register', desc: 'Create your account as donor or recipient' },
              { num: 2, title: 'Find Donors', desc: 'Search for available donors near you' },
              { num: 3, title: 'Connect', desc: 'Send requests and connect with donors' },
              { num: 4, title: 'Donate/Receive', desc: 'Complete the donation process safely' }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <p className="text-red-100">Active Donors</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <p className="text-red-100">Lives Saved</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2K+</div>
              <p className="text-red-100">Requests Fulfilled</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-red-100">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Whether you need blood urgently or want to donate, join thousands who are saving lives.
          </p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
