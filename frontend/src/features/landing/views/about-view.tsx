import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Music,
  Users,
  Headphones,
  MessageSquare,
  Badge,
  Calendar,
  Heart,
} from "lucide-react";
import { Link } from "react-router";

export function AboutView() {
  const features = [
    {
      icon: <Badge className="h-8 w-8 text-purple-500" />,
      title: "Underground Discovery",
      description:
        "Find hidden gems and emerging talent before they hit the mainstream. Support artists at the beginning of their journey.",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Artist Promotion",
      description:
        "Help underground bands and solo artists get discovered by passionate music lovers who appreciate authentic talent.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Live Event Promotion",
      description:
        "Discover intimate venue performances, underground shows, and upcoming concerts from emerging artists.",
    },
    {
      icon: <Headphones className="h-8 w-8 text-orange-500" />,
      title: "Early Access",
      description:
        "Be the first to hear new tracks from underground artists and get exclusive access to unreleased music.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-pink-500" />,
      title: "Artist Connection",
      description:
        "Connect directly with artists through our community forums and help shape the future of music.",
    },
    {
      icon: <Music className="h-8 w-8 text-cyan-500" />,
      title: "Authentic Curation",
      description:
        "Real music lovers curating and sharing discoveries, not just algorithm-driven recommendations.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="py-20 px-4 text-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-600">
            Discover Underground Music
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Where underground artists meet passionate music lovers. Support
            emerging talent and discover your next musical obsession.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Link to="/signup&role=listener">
                <Headphones className="h-5 w-5 mr-2" />
                Discover Artists
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Link to="/signup&role=artist">
                <Badge className="h-5 w-5 mr-2" />
                Promote Your Band
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supporting Underground Music
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              TuneSpace was created to bridge the gap between underground
              artists and the music lovers who crave authentic, undiscovered
              talent. We believe the best music often comes from artists who
              haven&apos;t yet been discovered by the mainstream.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">
                Why Underground Artists?
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Underground artists bring raw authenticity and innovative
                  sounds that haven&apos;t been filtered through industry
                  machinery. They&apos;re creating music for the love of it, not
                  just commercial success.
                </p>
                <p>
                  By connecting these artists with passionate listeners,
                  we&apos;re helping to shape the future of music while giving
                  talented musicians the recognition they deserve.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Growing Community</h3>
              <p className="text-muted-foreground">
                A thriving ecosystem of underground artists, passionate
                listeners, and music lovers all working together to shape the
                future of music discovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How We Support Artists & Fans
            </h2>
            <p className="text-lg text-muted-foreground">
              Connecting underground talent with passionate music lovers through
              authentic discovery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-orange-600">
                For Underground Artists
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ready to get your music heard by people who truly appreciate
                underground talent? TuneSpace provides the platform and
                community to help you grow your fanbase organically.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Badge className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300">
                      Get Discovered
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Reach music lovers who actively seek out new, underground
                      talent
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-300">
                      Promote Shows
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Share your upcoming gigs and connect with local fans
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-pink-700 dark:text-pink-300">
                      Build Community
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Connect directly with fans and fellow musicians
                    </p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="mt-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <Link to="/signup&role=artist">
                  <Badge className="h-5 w-5 mr-2" />
                  Register Your Band
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-8 backdrop-blur-sm border border-orange-200/30">
                <div className="text-center">
                  <div className="relative mx-auto w-32 h-32 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full animate-pulse opacity-75"></div>
                    <div
                      className="absolute inset-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse opacity-75"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Badge className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Join Our Artists</h3>
                  <p className="text-muted-foreground">
                    Making waves on TuneSpace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm border border-emerald-200/30">
                <div className="text-center">
                  <div className="relative mx-auto w-32 h-32 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full animate-pulse opacity-75"></div>
                    <div
                      className="absolute inset-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full animate-pulse opacity-75"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Headphones className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Music Lovers Unite
                  </h3>
                  <p className="text-muted-foreground">
                    Discovering new sounds daily
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-emerald-600">
                For Music Enthusiasts
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Tired of the same mainstream music? Join a community of
                passionate listeners who discover and support underground
                artists creating tomorrow&apos;s classics.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
                      First Access
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Hear new tracks before they go mainstream
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-teal-700 dark:text-teal-300">
                      Real Discussions
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Talk music with fellow enthusiasts who share your passion
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300">
                      Support Artists
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Help shape the careers of tomorrow&apos;s stars
                    </p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="mt-8 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
              >
                <Link to="/signup&role=listener">
                  <Headphones className="h-5 w-5 mr-2" />
                  Start Discovering
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Underground Music Revolution
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you&apos;re creating the music or discovering it, TuneSpace
            is where underground culture thrives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-purple-600"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
