export const dynamic = 'force-static'
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-sage-800 mb-4">Privacy Policy</h1>
          <p className="text-sage-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="prose prose-sage max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">1. Introduction</h2>
              <p className="text-sage-700 mb-4">
                Cropple.ai ("we," "our," or "us") is committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our agricultural management services (collectively, the "Service").
              </p>
              <p className="text-sage-700 mb-4">
                By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please do not access the Service.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">2.1 Personal Information</h3>
              <p className="text-sage-700 mb-4">We collect the following personal information when you register and use our Service:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials (username, encrypted password)</li>
                <li>Profile information (farm type, user preferences)</li>
                <li>Location data (farm coordinates, addresses)</li>
                <li>Agricultural data (crop information, field boundaries, yield data)</li>
                <li>Financial information (transaction records, revenue/expense data)</li>
                <li>Communication data (messages, support tickets)</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Location data (GPS coordinates when permission granted)</li>
                <li>Cookies and tracking technologies</li>
                <li>Log files and analytics data</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">2.3 Third-Party Data</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Weather data from meteorological services</li>
                <li>Satellite imagery and agricultural indices</li>
                <li>Market data and commodity prices</li>
                <li>Geographic and mapping data</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">3. How We Use Your Information</h2>
              <p className="text-sage-700 mb-4">We use the collected information for the following purposes:</p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">3.1 Service Provision</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Create and maintain your account</li>
                <li>Provide agricultural insights and recommendations</li>
                <li>Generate weather forecasts and alerts</li>
                <li>Process and analyze satellite imagery</li>
                <li>Calculate yield predictions and crop health metrics</li>
                <li>Facilitate financial tracking and reporting</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">3.2 Communication</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Send service notifications and alerts</li>
                <li>Provide customer support</li>
                <li>Share product updates and features</li>
                <li>Respond to inquiries and feedback</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">3.3 Improvement and Analytics</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Analyze usage patterns and improve our services</li>
                <li>Develop new features and functionalities</li>
                <li>Train and improve AI/ML models</li>
                <li>Conduct research and development</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-sage-700 mb-4">For users in the European Union, we process your personal data based on:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li><strong>Contract Performance:</strong> Processing necessary to perform our services</li>
                <li><strong>Legitimate Interests:</strong> Service improvement, fraud prevention, direct marketing</li>
                <li><strong>Consent:</strong> Marketing communications, optional data collection</li>
                <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">5. Information Sharing and Disclosure</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">5.1 Third-Party Service Providers</h3>
              <p className="text-sage-700 mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Cloud hosting providers (AWS, Google Cloud, etc.)</li>
                <li>Weather data suppliers</li>
                <li>Satellite imagery providers</li>
                <li>Payment processors</li>
                <li>Analytics and monitoring services</li>
                <li>Customer support platforms</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">5.2 Business Transfers</h3>
              <p className="text-sage-700 mb-4">
                In the event of a merger, acquisition, or asset sale, your personal information may be transferred as part of that transaction.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">5.3 Legal Requirements</h3>
              <p className="text-sage-700 mb-4">We may disclose your information if required by law or in response to:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Court orders or legal processes</li>
                <li>Government or regulatory requests</li>
                <li>Protection of our rights and safety</li>
                <li>Prevention of fraud or illegal activities</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">6. Data Security</h2>
              <p className="text-sage-700 mb-4">We implement appropriate technical and organizational security measures:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Encryption in transit and at rest</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee training and confidentiality agreements</li>
                <li>Incident response procedures</li>
                <li>Regular backups and disaster recovery</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">7. Your Rights and Choices</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">7.1 GDPR Rights (EU Users)</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Restriction:</strong> Limit processing of your data</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">7.2 CCPA Rights (California Users)</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of sale of personal information</li>
                <li>Right to non-discrimination for exercising these rights</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">7.3 General Rights</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Update your account information</li>
                <li>Opt-out of marketing communications</li>
                <li>Delete your account</li>
                <li>Control cookie preferences</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">8. Data Retention</h2>
              <p className="text-sage-700 mb-4">We retain your information for as long as:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Your account remains active</li>
                <li>Necessary to provide our services</li>
                <li>Required by law or regulation</li>
                <li>Needed for legitimate business purposes</li>
              </ul>
              <p className="text-sage-700 mb-4">
                Upon account deletion, we will delete or anonymize your data within 30 days, except where retention is required by law.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">9. International Data Transfers</h2>
              <p className="text-sage-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>EU-US Data Privacy Framework compliance</li>
                <li>Standard Contractual Clauses</li>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Other legally recognized transfer mechanisms</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">10. Children's Privacy</h2>
              <p className="text-sage-700 mb-4">
                Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">11. Cookies and Tracking</h2>
              <p className="text-sage-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns</li>
                <li>Provide personalized content</li>
                <li>Enable security features</li>
                <li>Facilitate third-party integrations</li>
              </ul>
              <p className="text-sage-700 mb-4">
                You can control cookie preferences through your browser settings or our cookie management tool.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">12. Changes to This Policy</h2>
              <p className="text-sage-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Posting the updated policy on this page</li>
                <li>Sending an email notification</li>
                <li>Providing in-app notifications</li>
              </ul>
              <p className="text-sage-700 mb-4">
                Changes take effect immediately upon posting, unless otherwise specified.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">13. Contact Information</h2>
              <p className="text-sage-700 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-sage-50 p-6 rounded-lg">
                <p className="text-sage-700 mb-2"><strong>Email:</strong> privacy@cropple.ai</p>
                <p className="text-sage-700 mb-2"><strong>Mailing Address:</strong></p>
                <p className="text-sage-700 mb-2">
                  Cropple.ai Inc.<br />
                  Privacy Department<br />
                  [Your Business Address]<br />
                  [City, State, ZIP Code]<br />
                  [Country]
                </p>
                <p className="text-sage-700 mb-2"><strong>Data Protection Officer:</strong> dpo@cropple.ai</p>
                <p className="text-sage-700"><strong>EU Representative:</strong> [If applicable]</p>
              </div>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">14. Supervisory Authority</h2>
              <p className="text-sage-700 mb-4">
                If you are located in the EU and believe we have not addressed your concerns, you have the right to lodge a complaint with your local supervisory authority.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}