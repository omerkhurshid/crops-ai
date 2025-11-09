export const dynamic = 'force-static'
export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-sage-800 mb-4">Terms of Service</h1>
          <p className="text-sage-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="prose prose-sage max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-sage-700 mb-4">
                Welcome to Cropple.ai ("we," "us," "our," "Company," or "Service"). These Terms of Service ("Terms") govern your access to and use of our agricultural management platform, website, mobile applications, and related services (collectively, the "Service").
              </p>
              <p className="text-sage-700 mb-4">
                By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of these terms, you may not access or use the Service.
              </p>
              <p className="text-sage-700 mb-4">
                These Terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">2. Description of Service</h2>
              <p className="text-sage-700 mb-4">
                Cropple.ai provides an agricultural management platform that offers:
              </p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Farm and field management tools</li>
                <li>Weather monitoring and forecasting</li>
                <li>Crop health analysis using satellite imagery</li>
                <li>Yield prediction and analytics</li>
                <li>Financial tracking and reporting</li>
                <li>AI-powered insights and recommendations</li>
                <li>Task management and planning tools</li>
                <li>Market data and pricing information</li>
                <li>Livestock management features</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">3. User Accounts and Eligibility</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">3.1 Account Creation</h3>
              <p className="text-sage-700 mb-4">
                To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">3.2 Account Security</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to immediately notify us of any unauthorized use of your account</li>
                <li>You are fully responsible for all activities that occur under your account</li>
                <li>We reserve the right to refuse service or terminate accounts at our discretion</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">3.3 Eligibility</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>You must be at least 18 years old to use this Service</li>
                <li>You must have the legal capacity to enter into binding agreements</li>
                <li>Your use must comply with all applicable laws and regulations</li>
                <li>You must not be barred from using the Service under applicable law</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">4. Subscription Plans and Payments</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">4.1 Service Plans</h3>
              <p className="text-sage-700 mb-4">
                We offer various subscription plans with different features and usage limits. Current plans and pricing are available on our website and may be updated from time to time.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">4.2 Payment Terms</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>All payments are non-refundable except as expressly provided</li>
                <li>We reserve the right to change pricing with 30 days' notice</li>
                <li>Failure to pay may result in service suspension or termination</li>
                <li>All fees are exclusive of taxes, which you are responsible for</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">4.3 Cancellation and Refunds</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>No refunds are provided for partial months or unused services</li>
                <li>We may offer refunds at our sole discretion for exceptional circumstances</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">5. User Content and Data</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">5.1 Your Content</h3>
              <p className="text-sage-700 mb-4">
                You retain ownership of all content, data, and information you upload, input, or provide to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, reproduce, and distribute your content solely for the purpose of providing and improving the Service.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">5.2 Content Standards</h3>
              <p className="text-sage-700 mb-4">You agree not to submit User Content that:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Is false, misleading, or inaccurate</li>
                <li>Violates any third-party rights</li>
                <li>Contains malware or harmful code</li>
                <li>Is illegal or promotes illegal activities</li>
                <li>Is defamatory, harassing, or offensive</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">5.3 Data Backup and Recovery</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>While we maintain regular backups, you are responsible for maintaining your own backups</li>
                <li>We do not guarantee the recovery of lost or deleted data</li>
                <li>Data export tools are available to help you maintain local copies</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">6. Acceptable Use Policy</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">6.1 Permitted Uses</h3>
              <p className="text-sage-700 mb-4">You may use the Service for legitimate agricultural management purposes in accordance with these Terms.</p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">6.2 Prohibited Uses</h3>
              <p className="text-sage-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Use the Service for any unlawful purpose or to solicit unlawful activity</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use automated scripts or bots to access the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Collect or harvest user information without consent</li>
                <li>Impersonate others or provide false identity information</li>
                <li>Use the Service to compete with us or develop competing products</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">7. AI and Machine Learning Services</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">7.1 AI-Generated Content</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Our AI services provide recommendations and insights based on data analysis</li>
                <li>AI-generated content is provided for informational purposes only</li>
                <li>You should use professional judgment and not rely solely on AI recommendations</li>
                <li>We do not guarantee the accuracy or completeness of AI-generated content</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">7.2 Model Training</h3>
              <p className="text-sage-700 mb-4">
                We may use aggregated, anonymized data to improve our AI models and services. Individual user data is not shared or used for training without explicit consent.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">8. Third-Party Services and Data</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">8.1 Third-Party Integrations</h3>
              <p className="text-sage-700 mb-4">
                Our Service integrates with various third-party services including weather providers, satellite imagery services, and mapping services. These integrations are subject to the third parties' terms and conditions.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">8.2 Third-Party Data</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Weather data, satellite imagery, and market data are provided by third parties</li>
                <li>We do not guarantee the accuracy or timeliness of third-party data</li>
                <li>Third-party data providers may have their own usage restrictions</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">9. Intellectual Property Rights</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">9.1 Our Rights</h3>
              <p className="text-sage-700 mb-4">
                The Service, including its software, algorithms, user interface, and content (excluding User Content), is owned by us and protected by intellectual property laws. We retain all rights not expressly granted to you.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">9.2 Limited License</h3>
              <p className="text-sage-700 mb-4">
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service in accordance with these Terms.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">9.3 Feedback</h3>
              <p className="text-sage-700 mb-4">
                Any feedback, suggestions, or ideas you provide regarding the Service become our property and may be used without restriction or compensation.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">10. Privacy and Data Protection</h2>
              <p className="text-sage-700 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using the Service, you agree to the collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">11. Service Availability and Modifications</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">11.1 Service Availability</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>We strive to maintain high service availability but do not guarantee uninterrupted access</li>
                <li>Scheduled maintenance will be communicated in advance when possible</li>
                <li>Service may be temporarily unavailable due to technical issues or maintenance</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">11.2 Service Modifications</h3>
              <p className="text-sage-700 mb-4">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice. We will not be liable for any modification, suspension, or discontinuation of the Service.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">12. Disclaimers and Limitations</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">12.1 Service Disclaimer</h3>
              <p className="text-sage-700 mb-4 font-semibold">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">12.2 Agricultural Decisions</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Our Service provides information and recommendations for agricultural decision-making</li>
                <li>You are responsible for all agricultural and business decisions</li>
                <li>We do not guarantee any specific agricultural outcomes or results</li>
                <li>Consult with agricultural professionals for specific situations</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">12.3 Limitation of Liability</h3>
              <p className="text-sage-700 mb-4 font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="text-sage-700 mb-4">
                In no event shall our total liability exceed the amount you paid for the Service in the 12 months preceding the claim.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">13. Indemnification</h2>
              <p className="text-sage-700 mb-4">
                You agree to indemnify, defend, and hold harmless Cropple.ai and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your use of the Service or violation of these Terms.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">14. Termination</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">14.1 Termination by You</h3>
              <p className="text-sage-700 mb-4">
                You may terminate your account at any time by following the cancellation process in your account settings.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">14.2 Termination by Us</h3>
              <p className="text-sage-700 mb-4">We may terminate or suspend your account immediately, without prior notice, for:</p>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Breach of these Terms</li>
                <li>Non-payment of fees</li>
                <li>Violation of applicable laws</li>
                <li>Fraudulent or illegal activity</li>
                <li>At our sole discretion for any reason</li>
              </ul>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">14.3 Effect of Termination</h3>
              <ul className="list-disc pl-6 text-sage-700 mb-4">
                <li>Your right to use the Service will cease immediately</li>
                <li>You remain liable for all charges incurred before termination</li>
                <li>We may delete your account and data after termination</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">15. Dispute Resolution</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">15.1 Informal Resolution</h3>
              <p className="text-sage-700 mb-4">
                Before initiating formal dispute resolution, we encourage you to contact us to seek informal resolution of any disputes.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">15.2 Binding Arbitration</h3>
              <p className="text-sage-700 mb-4">
                Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization] rather than in court, except that you may assert claims in small claims court if they qualify.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">15.3 Class Action Waiver</h3>
              <p className="text-sage-700 mb-4">
                You agree that any arbitration or legal proceeding shall be limited to the dispute between us and you individually, and you waive your right to participate in class actions or representative proceedings.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">16. International Users</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">16.1 Global Access</h3>
              <p className="text-sage-700 mb-4">
                The Service is available globally, but features and data may vary by location due to regulatory requirements or data availability.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">16.2 Local Laws</h3>
              <p className="text-sage-700 mb-4">
                You are responsible for compliance with local laws and regulations in your jurisdiction. If any provision of these Terms conflicts with local law, the local law shall prevail to the extent of the conflict.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">16.3 Export Controls</h3>
              <p className="text-sage-700 mb-4">
                The Service may be subject to export control laws and regulations. You agree to comply with all applicable export control and sanctions laws.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">17. Governing Law and Jurisdiction</h2>
              <p className="text-sage-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in [Your Jurisdiction].
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">18. General Provisions</h2>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">18.1 Entire Agreement</h3>
              <p className="text-sage-700 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">18.2 Severability</h3>
              <p className="text-sage-700 mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">18.3 Waiver</h3>
              <p className="text-sage-700 mb-4">
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">18.4 Assignment</h3>
              <p className="text-sage-700 mb-4">
                You may not assign or transfer these Terms without our written consent. We may assign these Terms without restriction.
              </p>
              <h3 className="text-xl font-semibold text-sage-700 mb-3">18.5 Updates to Terms</h3>
              <p className="text-sage-700 mb-4">
                We reserve the right to update these Terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-4">19. Contact Information</h2>
              <p className="text-sage-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-sage-50 p-6 rounded-lg">
                <p className="text-sage-700 mb-2"><strong>Email:</strong> legal@cropple.ai</p>
                <p className="text-sage-700 mb-2"><strong>Support:</strong> support@cropple.ai</p>
                <p className="text-sage-700 mb-2"><strong>Mailing Address:</strong></p>
                <p className="text-sage-700 mb-2">
                  Cropple.ai Inc.<br />
                  Legal Department<br />
                  [Your Business Address]<br />
                  [City, State, ZIP Code]<br />
                  [Country]
                </p>
                <p className="text-sage-700"><strong>Phone:</strong> [Your Phone Number]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}