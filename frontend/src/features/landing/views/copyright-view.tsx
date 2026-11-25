import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Copyright,
  Music,
  Shield,
  FileText,
  AlertTriangle,
  Mail,
  Scale,
  UserCheck,
  Download,
  Upload,
} from "lucide-react";
import { Link } from "react-router";

export function CopyrightView() {
  return (
    <div className="min-h-screen">
      <section className="py-16 px-4 text-center bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-violet-900/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Copyright className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Copyright Policy
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Protecting creators&apos; rights while fostering a vibrant music
            community. Learn about our copyright policies and DMCA procedures.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Card className="mb-8 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  Our Commitment to Copyright Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  TuneSpace respects the intellectual property rights of
                  artists, creators, and copyright holders. This Copyright
                  Policy explains how we handle copyright-protected content and
                  respond to claims of copyright infringement in accordance with
                  the Digital Millennium Copyright Act (DMCA).
                </p>
                <p>
                  As a platform dedicated to supporting underground and emerging
                  artists, we understand the critical importance of protecting
                  creators&apos; rights while fostering a community where music
                  can be discovered and shared responsibly.
                </p>
                <p className="text-sm text-muted-foreground">
                  We take copyright infringement seriously and have implemented
                  robust procedures to address violations promptly and fairly.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Understanding Copyright on TuneSpace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    What is Protected
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Musical compositions (lyrics and melodies)</li>
                    <li>Sound recordings and audio tracks</li>
                    <li>Album artwork and promotional materials</li>
                    <li>Music videos and visual content</li>
                    <li>Written content such as reviews and articles</li>
                    <li>Photographs of artists and performances</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Rights of Copyright Holders
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Exclusive right to reproduce their work</li>
                    <li>Control over public performance and display</li>
                    <li>Right to create derivative works</li>
                    <li>Authority to distribute copies of their work</li>
                    <li>
                      Right to authorize or prohibit streaming and downloads
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    User Responsibilities
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Only upload content you own or have permission to use
                    </li>
                    <li>Respect licensing terms for any third-party content</li>
                    <li>Properly attribute content when required</li>
                    <li>Understand fair use limitations and exceptions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-red-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-red-600" />
                  DMCA Compliance and Takedown Procedures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Filing a Copyright Claim
                  </h4>
                  <p className="mb-4">
                    If you believe your copyrighted work has been infringed on
                    TuneSpace, you may submit a DMCA takedown notice. Your
                    notice must include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your physical or electronic signature</li>
                    <li>
                      Identification of the copyrighted work claimed to be
                      infringed
                    </li>
                    <li>
                      Location of the allegedly infringing material on our
                      platform
                    </li>
                    <li>Your contact information (address, phone, email)</li>
                    <li>
                      A statement of good faith belief that use is not
                      authorized
                    </li>
                    <li>
                      A statement that the information is accurate and
                      you&apos;re authorized to act
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200/50">
                  <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                    Important Legal Notice
                  </h4>
                  <p className="text-sm">
                    False claims may result in liability for damages, including
                    costs and attorney fees. Only file a DMCA notice if you have
                    a good faith belief that the content infringes your
                    copyright.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Our Response Process
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We review all DMCA notices within 24-48 hours</li>
                    <li>Valid claims result in immediate content removal</li>
                    <li>We notify the content uploader of the takedown</li>
                    <li>
                      Repeat infringers may have their accounts terminated
                    </li>
                    <li>We maintain records of all copyright claims</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                  Counter-Notification Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you believe your content was wrongfully removed due to a
                  copyright claim, you may file a counter-notification. This
                  process allows for the restoration of content that was removed
                  in error or due to misidentification.
                </p>

                <div>
                  <h4 className="font-semibold mb-3">
                    Counter-Notice Requirements
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your physical or electronic signature</li>
                    <li>
                      Identification of the removed content and its former
                      location
                    </li>
                    <li>
                      A statement under penalty of perjury that the removal was
                      a mistake
                    </li>
                    <li>Your name, address, and phone number</li>
                    <li>
                      Consent to jurisdiction of federal court in your district
                    </li>
                    <li>
                      Agreement to accept service from the complaining party
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Counter-Notice Process</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We review counter-notifications for completeness</li>
                    <li>
                      Valid counter-notices are forwarded to the original
                      claimant
                    </li>
                    <li>Content may be restored in 10-14 business days</li>
                    <li>
                      Restoration occurs unless claimant files a court action
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  Safe Harbor Protections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  TuneSpace operates under the DMCA Safe Harbor provisions,
                  which provide certain protections for online service providers
                  that comply with copyright law.
                </p>

                <div>
                  <h4 className="font-semibold mb-3">
                    Our Safe Harbor Compliance
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      We have designated a DMCA agent for receiving notices
                    </li>
                    <li>We respond promptly to valid takedown requests</li>
                    <li>We implement a repeat infringer policy</li>
                    <li>
                      We don&apos;t have actual knowledge of infringing activity
                    </li>
                    <li>
                      We don&apos;t receive financial benefit from infringing
                      activity
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">
                    Repeat Infringer Policy
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Users with multiple valid copyright claims face account
                      suspension
                    </li>
                    <li>
                      Three or more valid claims may result in permanent account
                      termination
                    </li>
                    <li>We maintain records of all copyright violations</li>
                    <li>Appeals are reviewed on a case-by-case basis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-cyan-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Music className="h-6 w-6 text-cyan-600" />
                  Fair Use and Licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Understanding Fair Use
                  </h4>
                  <p className="mb-4">
                    Fair use allows limited use of copyrighted material for
                    purposes such as criticism, comment, news reporting,
                    teaching, or research. Consider these factors:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Purpose and character of use (commercial vs. educational)
                    </li>
                    <li>Nature of the copyrighted work</li>
                    <li>Amount and substantiality of the portion used</li>
                    <li>Effect of use on the market for the original work</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Fair use is determined case-by-case and doesn&apos;t
                    guarantee protection from copyright claims.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Music Licensing on TuneSpace
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Artists retain full ownership of their uploaded content
                    </li>
                    <li>
                      We work with performance rights organizations (ASCAP, BMI,
                      SESAC)
                    </li>
                    <li>
                      Streaming royalties are distributed according to licensing
                      agreements
                    </li>
                    <li>
                      Cover songs require mechanical licenses from original
                      publishers
                    </li>
                    <li>
                      Samples and interpolations need clearance from rights
                      holders
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Creative Commons and Open Licenses
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      We support Creative Commons licensing for flexible sharing
                    </li>
                    <li>
                      Artists can choose appropriate license terms for their
                      work
                    </li>
                    <li>
                      Clear licensing information is displayed with each track
                    </li>
                    <li>
                      Users must comply with specific license requirements
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Download className="h-6 w-6 text-indigo-600" />
                  Artist Rights and Content Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Content Ownership
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Artists retain full copyright ownership of their uploaded
                      music
                    </li>
                    <li>
                      TuneSpace receives only a limited license to host and
                      distribute
                    </li>
                    <li>Artists can remove their content at any time</li>
                    <li>Exclusive rights remain with the original creators</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Distribution Control
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Artists control download permissions for their tracks
                    </li>
                    <li>Streaming settings can be customized per release</li>
                    <li>Geographic restrictions can be applied when needed</li>
                    <li>Commercial use permissions are artist-controlled</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Revenue and Royalties
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Artists receive the majority share of streaming revenues
                    </li>
                    <li>Transparent reporting of plays and earnings</li>
                    <li>No hidden fees or deductions from artist payments</li>
                    <li>Regular payment schedules and detailed statements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-yellow-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  Reporting Copyright Violations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">How to Report</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use our online DMCA form for fastest processing</li>
                    <li>Email detailed notices to our designated DMCA agent</li>
                    <li>Include all required information to avoid delays</li>
                    <li>Provide specific URLs or content identifiers</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200/50">
                  <h4 className="font-semibold mb-3 text-yellow-700 dark:text-yellow-400">
                    DMCA Designated Agent
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> Copyright Agent
                    </p>
                    <p>
                      <strong>Email:</strong> copyright@tunespace.com
                    </p>
                    <p>
                      <strong>Address:</strong> TuneSpace Copyright Department
                      <br />
                      123 Music Street
                      <br />
                      Audio City, AC 12345
                      <br />
                      United States
                    </p>
                    <p>
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Response Timeline</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Acknowledgment within 24 hours of receipt</li>
                    <li>Initial review completed within 48 hours</li>
                    <li>Content removal within 72 hours for valid claims</li>
                    <li>Follow-up communication throughout the process</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-pink-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-pink-600" />
                  Copyright Education and Prevention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Best Practices for Users
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Always verify you have rights to upload content</li>
                    <li>Obtain proper licenses for cover songs and remixes</li>
                    <li>
                      Credit original artists and rights holders appropriately
                    </li>
                    <li>
                      Understand the difference between streaming and download
                      rights
                    </li>
                    <li>
                      When in doubt, seek legal advice or don&apos;t upload
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Educational Resources
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Copyright basics guide for musicians</li>
                    <li>Licensing tutorial for cover songs</li>
                    <li>Fair use guidelines and examples</li>
                    <li>Sample clearance procedures</li>
                    <li>International copyright considerations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Proactive Measures
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Automated content recognition technology</li>
                    <li>User education during the upload process</li>
                    <li>Regular copyright compliance reminders</li>
                    <li>Partnership with rights management organizations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-gray-600" />
                  Contact and Legal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Copyright Questions</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      General copyright questions: copyright@tunespace.com
                    </li>
                    <li>DMCA takedown notices: dmca@tunespace.com</li>
                    <li>Licensing inquiries: licensing@tunespace.com</li>
                    <li>Legal department: legal@tunespace.com</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Policy Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    This Copyright Policy may be updated periodically to reflect
                    changes in law or our practices. Material changes will be
                    communicated to users via email or platform notification.
                    Continued use of TuneSpace after changes constitutes
                    acceptance of the updated policy.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Disclaimer:</strong> This policy provides general
                    information and should not be considered legal advice.
                    Copyright law is complex and varies by jurisdiction. For
                    specific legal questions, consult with a qualified attorney.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Share Your Music?
          </h2>
          <p className="text-muted-foreground mb-6">
            Now that you understand our copyright policies, start sharing your
            original music with the TuneSpace community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/terms">View Terms</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
