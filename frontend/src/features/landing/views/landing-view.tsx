import { Button } from "@/shared/ui/button";
import {
  Headphones,
  Music,
  Calendar,
  PlayCircle,
  Badge,
  Heart,
  Users,
} from "lucide-react";
import { Link } from "react-router";

export function LandingView() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-800/40 to-pink-800/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.blue.700/30),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.purple.700/30),transparent_70%)]" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

        <div className="container relative mx-auto py-24 px-4 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 drop-shadow-sm">
            Discover Your Sound Universe
          </h1>
          <p className="text-xl max-w-2xl text-gray-100 drop-shadow-sm">
            Connect with artists, discover new music, and join a community of
            music enthusiasts all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white"
              asChild
            >
              <Link to="/signup">
                <Headphones className="h-5 w-5" /> Start Exploring
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Why TuneSpace?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-purple-200/30 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all hover:border-purple-300/50">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center">
              <Badge className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-purple-500">
              Underground Artists
            </h3>
            <p className="text-muted-foreground">
              Discover hidden gems and support emerging talent before they hit
              the mainstream.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-blue-200/30 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all hover:border-blue-300/50">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-blue-500">
              Connect & Chat
            </h3>
            <p className="text-muted-foreground">
              Chat with fellow music lovers, join discussions, and build your
              network of musical connections.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-pink-200/30 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all hover:border-pink-300/50">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-pink-500">Live Events</h3>
            <p className="text-muted-foreground">
              Discover concerts, festivals, and intimate venue performances from
              your favorite artists. Get notified about upcoming shows and
              connect with other attendees in your area.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-12 rounded-xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 relative flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl scale-150 animate-pulse" />
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-lg scale-125 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />

                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full p-8 shadow-2xl border border-white/20">
                  <div className="flex flex-col items-center justify-center text-white">
                    <div className="relative mb-2">
                      <Headphones className="h-12 w-12 text-white drop-shadow-lg" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping" />
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                        TuneSpace
                      </div>
                      <div className="text-xs text-blue-100 tracking-wider uppercase">
                        Your Sound Universe
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute -top-2 -right-2 text-yellow-300 animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <Music className="h-5 w-5" />
                  </div>
                  <div
                    className="absolute -bottom-1 -left-2 text-pink-300 animate-bounce"
                    style={{ animationDelay: "1.5s" }}
                  >
                    <Heart className="h-4 w-4" />
                  </div>
                  <div
                    className="absolute top-1/2 -left-3 text-cyan-300 animate-bounce"
                    style={{ animationDelay: "2s" }}
                  >
                    <PlayCircle className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">
                Join Our Music Community
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg">
                Connect with other music enthusiasts, share your favorite
                tracks, and discover new artists curated by people who share
                your taste.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-200/30">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">
                      Active Community
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Always someone to chat with
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-purple-200/30">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600">
                      Personalized Experience
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tailored just for you
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500/10 to-rose-500/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-pink-200/30">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-pink-600">
                      Endless Discovery
                    </div>
                    <div className="text-sm text-muted-foreground">
                      New music every day
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-8 md:p-12">
          <div className="absolute inset-0 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10" />

          <div className="relative flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-white">
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-cyan-200">
                Are You a Music Lover?
              </h2>
              <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                Passionate about discovering new sounds? Join a community of
                music enthusiasts who live and breathe music. Dive deep into
                conversations, share discoveries, and connect with like-minded
                souls.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                    <Headphones className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Early Access</div>
                    <div className="text-sm text-emerald-200">
                      Hear tracks before they&apos;re mainstream
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Deep Discussions
                    </div>
                    <div className="text-sm text-teal-200">
                      Talk music with real fans
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Curated Feeds
                    </div>
                    <div className="text-sm text-cyan-200">
                      Personalized recommendations
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    <PlayCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Support Artists
                    </div>
                    <div className="text-sm text-blue-200">
                      Help shape music&apos;s future
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 animate-pulse" />
                <div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-500/40 to-blue-500/40 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/50 to-purple-500/50 animate-pulse"
                  style={{ animationDelay: "2s" }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                    <Headphones className="h-16 w-16 text-white" />
                  </div>
                </div>

                {[
                  {
                    icon: PlayCircle,
                    position: "top-8 left-1/2 -translate-x-1/2",
                    delay: "0s",
                  },
                  {
                    icon: Heart,
                    position: "right-8 top-1/2 -translate-y-1/2",
                    delay: "0.5s",
                  },
                  {
                    icon: Music,
                    position: "bottom-8 left-1/2 -translate-x-1/2",
                    delay: "1s",
                  },
                  {
                    icon: Users,
                    position: "left-8 top-1/2 -translate-y-1/2",
                    delay: "1.5s",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`absolute ${item.position} bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30 animate-bounce`}
                      style={{
                        animationDelay: item.delay,
                        animationDuration: "2s",
                      }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-8 md:p-12">
          <div className="absolute inset-0 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10" />

          <div className="relative flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 relative">
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 animate-pulse" />
                <div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500/40 to-pink-500/40 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute inset-8 rounded-full bg-gradient-to-br from-pink-500/50 to-rose-500/50 animate-pulse"
                  style={{ animationDelay: "2s" }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                    <Badge className="h-16 w-16 text-white" />
                  </div>
                </div>

                {[
                  {
                    icon: Music,
                    position: "top-8 left-1/2 -translate-x-1/2",
                    delay: "0s",
                  },
                  {
                    icon: Users,
                    position: "right-8 top-1/2 -translate-y-1/2",
                    delay: "0.5s",
                  },
                  {
                    icon: Calendar,
                    position: "bottom-8 left-1/2 -translate-x-1/2",
                    delay: "1s",
                  },
                  {
                    icon: Heart,
                    position: "left-8 top-1/2 -translate-y-1/2",
                    delay: "1.5s",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`absolute ${item.position} bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30 animate-bounce`}
                      style={{
                        animationDelay: item.delay,
                        animationDuration: "2s",
                      }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 text-white">
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-pink-200">
                Are You an Artist?
              </h2>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Ready to share your music with the world? TuneSpace is the
                perfect platform for underground artists, bands, and musicians
                to get discovered by passionate music lovers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                    <Badge className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Get Discovered
                    </div>
                    <div className="text-sm text-orange-200">
                      Reach new fans organically
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Build Community
                    </div>
                    <div className="text-sm text-red-200">
                      Connect with your audience
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Promote Events
                    </div>
                    <div className="text-sm text-pink-200">
                      Share your upcoming shows
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Share Your Art
                    </div>
                    <div className="text-sm text-yellow-200">
                      Upload and showcase tracks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 md:p-12">
          <div className="absolute inset-0 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10" />

          <div className="relative text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
              Ready to Join the Space for Tunes?
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Whether you&apos;re an artist ready to share your sound or a music
              lover seeking your next obsession,
              <br />
              TuneSpace is where musical journeys begin. Join thousands
              discovering and creating the future of music.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-lg px-8 py-4"
                asChild
              >
                <Link to="/signup">
                  <Headphones className="h-5 w-5" /> Get Started Now
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Start discovering instantly</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
