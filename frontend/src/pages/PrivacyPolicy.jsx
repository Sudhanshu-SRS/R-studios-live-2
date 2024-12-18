import React from 'react';
import Title from '../components/Title';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Title text1="PRIVACY" text2="POLICY" />
      <div className="mt-8 space-y-4">
        <p>At Rashi Studio, we value your trust and respect your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website, www.rashistudio.com. By accessing or using our website, you agree to the terms outlined in this policy.</p>
        
        <h2 className="text-lg font-semibold">Information We Collect</h2>
        <p>We collect two types of information:</p>
        <ul className="list-disc list-inside">
          <li><strong>Personal Information:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Name, address, phone number, email address, and payment details when you make a purchase.</li>
              <li>Information provided by you during account creation, subscription to newsletters, or filling out forms.</li>
            </ul>
          </li>
          <li><strong>Non-Personal Information:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Browser type, device information, IP address, and website usage data through cookies and analytics tools.</li>
            </ul>
          </li>
        </ul>

        <h2 className="text-lg font-semibold">Use of Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc list-inside">
          <li>Process and fulfill your orders.</li>
          <li>Provide personalized shopping experiences.</li>
          <li>Improve our products and services based on your feedback.</li>
          <li>Send promotional emails, updates, and offers (only with your consent).</li>
          <li>Ensure the security of our website.</li>
        </ul>

        <h2 className="text-lg font-semibold">Sharing of Information</h2>
        <p>We do not sell or share your personal information with third parties, except:</p>
        <ul className="list-disc list-inside">
          <li>To trusted service providers who assist us in operations like payment processing, order delivery, or marketing.</li>
          <li>When required by law or to protect our legal rights.</li>
        </ul>

        <h2 className="text-lg font-semibold">Data Security</h2>
        <p>We implement appropriate technical and organizational measures to safeguard your information against unauthorized access, loss, or misuse.</p>

        <h2 className="text-lg font-semibold">Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside">
          <li>Access and update your personal information.</li>
          <li>Opt-out of receiving promotional emails by clicking the "Unsubscribe" link.</li>
          <li>Request the deletion of your personal data, subject to legal requirements.</li>
        </ul>

        <h2 className="text-lg font-semibold">Cookies</h2>
        <p>We use cookies to enhance your browsing experience and gather insights into website performance. You can control cookie preferences through your browser settings.</p>

        <p>For further details or queries regarding our Privacy Policy, please contact us at:</p>
        <p>Tel: (+91) 9764804422</p>
        <p>Email: rashifashionoffice@gmail.com</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;