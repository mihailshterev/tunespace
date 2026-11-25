import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Shield, Eye, Lock, Users, Mail, Settings } from "lucide-react";
import { Link } from "react-router";

export function PrivacyView() {
  return (
    <div className="min-h-screen">
      <section className="py-16 px-4 text-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
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
            <Card className="mb-8 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  At TuneSpace, we are committed to protecting your privacy and
                  ensuring transparency about how we handle your personal
                  information. This Privacy Policy explains what information we
                  collect, how we use it, and your rights regarding your data.
                </p>
                <p>
                  By using TuneSpace, you agree to the collection and use of
                  information in accordance with this policy. If you do not
                  agree with our practices, please do not use our service.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Personal Information
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Account information (username, email address, profile
                      details)
                    </li>
                    <li>Music preferences and listening history</li>
                    <li>Content you create (posts, comments, reviews)</li>
                    <li>Communication data when you contact us</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Spotify Integration
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Spotify profile information (when you connect your
                      account)
                    </li>
                    <li>Recently played tracks and listening activity</li>
                    <li>Playlists and saved music (with your permission)</li>
                    <li>Music taste and preferences data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">
                    Technical Information
                  </h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Usage analytics and interaction data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-green-600" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Provide and improve our music discovery and social features
                  </li>
                  <li>Personalize your experience and music recommendations</li>
                  <li>
                    Connect you with underground artists and like-minded music
                    lovers
                  </li>
                  <li>
                    Enable communication through our forums and messaging
                    features
                  </li>
                  <li>
                    Send you notifications about new music, events, and platform
                    updates
                  </li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-orange-600" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>With Other Users:</strong> Profile information,
                    music activity, and content you choose to share publicly
                  </li>
                  <li>
                    <strong>With Artists:</strong> Aggregated listening data to
                    help underground artists understand their audience
                  </li>
                  <li>
                    <strong>With Spotify:</strong> When you connect your Spotify
                    account, we access data according to Spotify&apos;s terms
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Trusted third parties
                    who help us operate our platform
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights and users&apos; safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with
                    mergers, acquisitions, or asset sales
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  We never sell your personal information to third parties for
                  marketing purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-red-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-red-600" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We implement industry-standard security measures to protect
                  your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication measures</li>
                  <li>
                    Secure data centers with physical and digital protections
                  </li>
                  <li>Regular staff training on data protection practices</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  While we strive to protect your information, no method of
                  transmission over the internet is 100% secure. We cannot
                  guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-cyan-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-cyan-600" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal
                    information we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    personal information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information (with some exceptions)
                  </li>
                  <li>
                    <strong>Portability:</strong> Request a copy of your data in
                    a machine-readable format
                  </li>
                  <li>
                    <strong>Restriction:</strong> Request limitation of how we
                    process your information
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain types of
                    processing
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent for
                    optional data processing
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us at{" "}
                  <a
                    href="mailto:privacy@tunespace.com"
                    className="text-primary hover:underline"
                  >
                    privacy@tunespace.com
                  </a>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-indigo-600" />
                  Cookies and Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze how you use our platform</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p>
                  You can control cookies through your browser settings.
                  However, disabling certain cookies may affect your experience
                  on TuneSpace.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-pink-200/50">
              <CardHeader>
                <CardTitle>Children&apos;s Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  TuneSpace is not intended for users under 13 years of age. We
                  do not knowingly collect personal information from children
                  under 13. If we become aware that we have collected such
                  information, we will take steps to delete it promptly.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-slate-200/50">
              <CardHeader>
                <CardTitle>Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new policy on this
                  page and updating the &quot;Last updated&quot; date.
                </p>
                <p>
                  Significant changes will be communicated through email or
                  prominent notices on our platform.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you have questions about this Privacy Policy or our data
                  practices, please contact us:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:privacy@tunespace.com"
                      className="text-primary hover:underline"
                    >
                      privacy@tunespace.com
                    </a>
                  </p>
                  <p>
                    <strong>Subject Line:</strong> Privacy Policy Inquiry
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  We will respond to your inquiry within 30 days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join TuneSpace?</h2>
          <p className="text-muted-foreground mb-6">
            Now that you understand how we protect your privacy, start
            discovering amazing underground music.
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
