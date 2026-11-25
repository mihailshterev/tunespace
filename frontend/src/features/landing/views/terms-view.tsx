import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Scale,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Eye,
  Settings,
  UserCheck,
  Globe,
  Ban,
  RefreshCw,
  Phone,
} from "lucide-react";
import { Link } from "react-router";

export function TermsView() {
  return (
    <div className="min-h-screen">
      <section className="py-16 px-4 text-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-green-900/20 dark:to-emerald-900/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Scale className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Please read these terms carefully before using TuneSpace. They
            govern your access to and use of our platform.
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
            <Card className="mb-8 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-green-600" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to TuneSpace! These Terms of Service
                  (&quot;Terms&quot;) govern your use of our website, mobile
                  application, and related services (collectively, the
                  &quot;Service&quot;) operated by TuneSpace (&quot;us,&quot;
                  &quot;we,&quot; or &quot;our&quot;).
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by
                  these Terms. If you disagree with any part of these terms,
                  then you may not access the Service.
                </p>
                <p className="text-sm text-muted-foreground">
                  These Terms constitute a legally binding agreement between you
                  and TuneSpace.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  By creating an account or using TuneSpace, you confirm that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You are at least 13 years old (or the minimum age required
                    in your jurisdiction)
                  </li>
                  <li>You have the legal capacity to enter into these Terms</li>
                  <li>
                    You will comply with all applicable laws and regulations
                  </li>
                  <li>All information you provide is accurate and truthful</li>
                  <li>
                    You will keep your account information secure and
                    confidential
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  User Accounts and Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Account Creation
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      You must provide accurate and complete information when
                      creating your account
                    </li>
                    <li>
                      You are responsible for maintaining the confidentiality of
                      your login credentials
                    </li>
                    <li>
                      You must notify us immediately of any unauthorized use of
                      your account
                    </li>
                    <li>One person may not maintain more than one account</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Account Security
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Use a strong, unique password for your TuneSpace account
                    </li>
                    <li>Do not share your account credentials with others</li>
                    <li>Log out from shared or public computers</li>
                    <li>Enable two-factor authentication when available</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">User Content</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      You retain ownership of content you post on TuneSpace
                    </li>
                    <li>
                      You grant us a license to use, display, and distribute
                      your content
                    </li>
                    <li>
                      You are responsible for ensuring you have rights to any
                      content you share
                    </li>
                    <li>
                      You must not upload copyrighted material without
                      permission
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-orange-600" />
                  Acceptable Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You agree to use TuneSpace responsibly and not engage in any
                  of the following prohibited activities:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">
                      Prohibited Content
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>
                        Harassment, hate speech, or discriminatory content
                      </li>
                      <li>Spam, scams, or misleading information</li>
                      <li>Copyrighted material without permission</li>
                      <li>Adult content or sexually explicit material</li>
                      <li>Violence, threats, or illegal activities</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">
                      Prohibited Activities
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Attempting to hack or compromise our systems</li>
                      <li>Creating fake accounts or impersonating others</li>
                      <li>Automated data collection or scraping</li>
                      <li>Interfering with other users&apos; experience</li>
                      <li>Violating any applicable laws or regulations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-indigo-600" />
                  Intellectual Property Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">TuneSpace Content</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The TuneSpace platform, including its design, features, and
                    functionality, is owned by TuneSpace and protected by
                    intellectual property laws.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">User Content</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      You retain ownership of content you create and share
                    </li>
                    <li>
                      You grant TuneSpace a license to use your content on our
                      platform
                    </li>
                    <li>
                      You must respect the intellectual property rights of
                      others
                    </li>
                    <li>We respond to valid copyright infringement claims</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">
                    Music and Audio Content
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Artists retain full ownership of their musical works
                    </li>
                    <li>
                      Sharing music requires proper licensing or permission
                    </li>
                    <li>
                      We work with music rights organizations for compliance
                    </li>
                    <li>
                      Unauthorized distribution of copyrighted music is
                      prohibited
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-cyan-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-cyan-600" />
                  Privacy and Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Your privacy is important to us. Our collection and use of
                  your personal information is governed by our Privacy Policy,
                  which forms part of these Terms.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We collect only necessary information to provide our
                    services
                  </li>
                  <li>
                    Your data is protected using industry-standard security
                    measures
                  </li>
                  <li>
                    You can request access to, correction of, or deletion of
                    your data
                  </li>
                  <li>
                    We do not sell your personal information to third parties
                  </li>
                  <li>We comply with applicable data protection regulations</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  For detailed information about our data practices, please
                  review our{" "}
                  <Link
                    to="/privacy"
                    className="text-cyan-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-yellow-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-yellow-600" />
                  Service Availability and Modifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Service Availability</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      We strive to maintain 99.9% uptime but cannot guarantee
                      uninterrupted service
                    </li>
                    <li>
                      Scheduled maintenance will be announced in advance when
                      possible
                    </li>
                    <li>
                      We are not liable for temporary unavailability due to
                      technical issues
                    </li>
                    <li>
                      Some features may be limited during maintenance periods
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Service Modifications</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      We may modify, update, or discontinue features at any time
                    </li>
                    <li>
                      Material changes will be communicated to users in advance
                    </li>
                    <li>Continued use after changes constitutes acceptance</li>
                    <li>We may add new features or remove outdated ones</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-red-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Ban className="h-6 w-6 text-red-600" />
                  Account Termination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">
                    Your Right to Terminate
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      You may delete your account at any time through your
                      settings
                    </li>
                    <li>Account deletion is permanent and cannot be undone</li>
                    <li>
                      Some information may be retained for legal or security
                      purposes
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Our Right to Terminate</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      We may suspend or terminate accounts for violations of
                      these Terms
                    </li>
                    <li>
                      Severe violations may result in immediate permanent
                      termination
                    </li>
                    <li>
                      We may terminate inactive accounts after extended periods
                    </li>
                    <li>We reserve the right to refuse service to anyone</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  Upon termination, your access to the Service will cease
                  immediately, but these Terms will remain in effect for
                  applicable provisions.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-gray-600" />
                  Disclaimers and Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Service Disclaimers</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      TuneSpace is provided &quot;as is&quot; without warranties
                      of any kind
                    </li>
                    <li>
                      We do not guarantee the accuracy of user-generated content
                    </li>
                    <li>
                      We are not responsible for interactions between users
                    </li>
                    <li>
                      Third-party integrations are subject to their own terms
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">
                    Limitation of Liability
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Our liability is limited to the maximum extent permitted
                      by law
                    </li>
                    <li>
                      We are not liable for indirect, incidental, or
                      consequential damages
                    </li>
                    <li>
                      Total liability shall not exceed the amount you paid us in
                      the past year
                    </li>
                    <li>
                      Some jurisdictions do not allow liability limitations
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-indigo-600" />
                  Changes to These Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. When
                  we make changes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We will update the &quot;Last updated&quot; date at the top
                    of this page
                  </li>
                  <li>
                    Material changes will be communicated via email or platform
                    notification
                  </li>
                  <li>
                    Continued use of the Service constitutes acceptance of
                    modified Terms
                  </li>
                  <li>
                    If you disagree with changes, you should discontinue use of
                    the Service
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  We encourage you to review these Terms periodically to stay
                  informed of any updates or changes.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Email:</strong> legal@tunespace.com
                  </p>
                  <p>
                    <strong>Support:</strong> support@tunespace.com
                  </p>
                  <p>
                    <strong>Address:</strong> TuneSpace Legal Department
                    <br />
                    123 Music Street
                    <br />
                    Audio City, AC 12345
                    <br />
                    United States
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  We aim to respond to all legal inquiries within 48 hours
                  during business days.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-purple-600" />
                  Governing Law and Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Governing Law</h4>
                  <p>
                    These Terms are governed by and construed in accordance with
                    the laws of the State of California, United States, without
                    regard to conflict of law principles.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Dispute Resolution</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Most disputes can be resolved through our customer support
                    </li>
                    <li>
                      For serious matters, we encourage mediation before
                      litigation
                    </li>
                    <li>
                      Any lawsuits must be filed in the courts of California
                    </li>
                    <li>
                      You waive the right to participate in class action
                      lawsuits
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join TuneSpace?</h2>
          <p className="text-muted-foreground mb-6">
            Now that you understand our terms, start discovering amazing
            underground music.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
