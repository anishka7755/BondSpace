import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Users,
  Home,
  Brain,
  Shield,
  Star,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  Mic,
} from "lucide-react";

export default function Index() {
  const [isSignupMode, setIsSignupMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blush-50 to-lavender-50 dark:from-black dark:via-black dark:to-black transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-rose-100/20 dark:border-rose-800/30 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-rose-500 to-lavender-500 p-2 rounded-lg shadow-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-lavender-600 dark:from-rose-400 dark:to-lavender-400 bg-clip-text text-transparent">
                BondSpace
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              >
                How it Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              >
                Reviews
              </a>
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              >
                Login
              </Link>
              <ThemeToggle />
              <Link to="/register">
                <Button className="bg-gradient-to-r from-rose-500 to-lavender-500 hover:from-rose-600 hover:to-lavender-600 shadow-lg rounded-full px-6 py-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="mb-4 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700"
              >
                ✨ AI-Powered Women's Co-Living
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Find Your Perfect
                <span className="bg-gradient-to-r from-rose-600 to-lavender-600 dark:from-rose-400 dark:to-lavender-400 bg-clip-text text-transparent block">
                  Roommate Match
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-200 mb-8 max-w-3xl lg:max-w-none leading-relaxed">
                Skip the awkward meetups. Our voice-AI creates personalized
                matches based on lifestyle, habits, and preferences for safe
                women's co-living spaces.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-lavender-500 hover:from-rose-600 hover:to-lavender-600 px-8 py-4 text-lg shadow-lg"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Voice Survey
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-2 border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  See How It Works
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-rose-500" />
                  100% Secure
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-rose-500" />
                  500+ successful matches
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-rose-500" />
                  95% compatibility rate
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-rose-100 to-blush-100 dark:from-rose-900/20 dark:to-blush-900/20">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F751defed763842c187080e7f1c0f05e1%2F7179f80c1d80409d9ff791cca5b6e676?format=webp&width=800"
                  alt="Two women sharing a cozy moment together in a warm, plant-filled living space"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-transparent to-transparent"></div>
              </div>

              {/* Floating UI Elements */}
              <div className="absolute -top-4 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-rose-100 dark:border-rose-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-rose-500 p-2 rounded-lg">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      AI Matching
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Smart compatibility
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-rose-100 dark:border-rose-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-blush-500 p-2 rounded-lg">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Voice Survey
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Just 5 questions
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-rose-100 dark:border-rose-800">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    95% Match Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-white dark:bg-gray-800/50 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose BondSpace?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with human psychology to
              create perfect living partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="bg-rose-100 dark:bg-rose-900/70 p-3 rounded-lg w-fit mb-4">
                  <Brain className="h-8 w-8 text-rose-600 dark:text-rose-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  AI-Powered Matching
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Our advanced algorithm analyzes lifestyle habits, personality
                  traits, and preferences to find your ideal roommate.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="bg-lavender-100 dark:bg-lavender-900/70 p-3 rounded-lg w-fit mb-4">
                  <Mic className="h-8 w-8 text-lavender-600 dark:text-lavender-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Voice Survey
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Complete a quick 5-question voice survey to capture your
                  authentic personality and living preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="bg-sage-100 dark:bg-sage-900/70 p-3 rounded-lg w-fit mb-4">
                  <Home className="h-8 w-8 text-sage-600 dark:text-sage-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Room Assignment
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Get matched with the perfect room based on your preferences
                  for floor, windows, and peaceful environment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="bg-blush-100 dark:bg-blush-900/70 p-3 rounded-lg w-fit mb-4">
                  <MessageSquare className="h-8 w-8 text-blush-600 dark:text-blush-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Collaborative Moodboards
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Plan your living space together with shared moodboards and
                  real-time collaboration tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="bg-rose-100 dark:bg-rose-900/70 p-3 rounded-lg w-fit mb-4">
                  <Heart className="h-8 w-8 text-rose-600 dark:text-rose-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Continuous Feedback
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Our system learns from your feedback to improve matches and
                  resolve any living arrangement issues.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="bg-gold-100 dark:bg-gold-900/70 p-3 rounded-lg w-fit mb-4">
                  <Shield className="h-8 w-8 text-gold-600 dark:text-gold-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Safe & Secure
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  All profiles are verified, data is encrypted, and we follow
                  strict privacy and safety protocols.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50/50 to-blush-50/50 dark:from-gray-900/50 dark:to-gray-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              See the Magic in Action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              Watch how our voice AI transforms natural conversation into
              detailed compatibility profiles, making roommate matching feel
              effortless and personal.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Voice Survey: Natural 5-minute conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-200">
                    Share your lifestyle, habits, and preferences through a
                    friendly chat with our AI assistant.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blush-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    AI Processing: Smart compatibility analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-200">
                    Our advanced algorithms analyze personality traits, living
                    habits, and preferences for perfect matches.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-lavender-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Perfect Match: Roommate + room recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-200">
                    Get matched with compatible roommates and discover rooms
                    that fit both your lifestyles and budgets.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button className="bg-gradient-to-r from-rose-500 to-lavender-500 hover:from-rose-600 hover:to-lavender-600 shadow-lg">
                  Try the Voice Survey
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-rose-100 to-blush-100 dark:from-rose-900/20 dark:to-blush-900/20">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F751defed763842c187080e7f1c0f05e1%2Fcf5ea42bfbc0456ea750e1e5ff2d5f78?format=webp&width=800"
                  alt="Three diverse women laughing together in a bright, modern living room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-transparent to-transparent"></div>
              </div>

              {/* Stats overlay */}
              <div className="absolute -bottom-6 left-6 right-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-rose-100 dark:border-rose-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      500+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      successful matches
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blush-600 dark:text-blush-400">
                      95%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      compatibility rate
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-lavender-600 dark:text-lavender-400">
                      Women-only
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      spaces
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-rose-50 to-lavender-50 dark:from-black dark:to-black transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              Get matched with your perfect roommate in just four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Voice Survey",
                description:
                  "Complete our 5-question voice survey about sleep, cleanliness, social habits, work, and diet.",
                icon: Mic,
                color: "rose",
              },
              {
                step: "2",
                title: "AI Matching",
                description:
                  "Our AI analyzes your responses and finds compatible roommates with detailed explanations.",
                icon: Brain,
                color: "lavender",
              },
              {
                step: "3",
                title: "Room Selection",
                description:
                  "Choose from recommended rooms that match your preferences and budget.",
                icon: Home,
                color: "sage",
              },
              {
                step: "4",
                title: "Move In",
                description:
                  "Collaborate on your shared space and provide feedback for continuous improvement.",
                icon: Heart,
                color: "blush",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className={`bg-${item.color}-100 dark:bg-${item.color}-900/70 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg`}
                >
                  <item.icon
                    className={`h-8 w-8 text-${item.color}-600 dark:text-${item.color}-300`}
                  />
                </div>
                <div
                  className={`text-2xl font-bold text-${item.color}-600 dark:text-${item.color}-300 mb-2`}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-lavender-500 dark:from-rose-600 dark:to-lavender-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Co-Living Community?
          </h2>
          <p className="text-xl text-rose-100 dark:text-rose-50 mb-8">
            Join hundreds of amazing women who found their ideal roommates and
            safe, supportive living spaces through BondSpace.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-rose-600 hover:bg-rose-50 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-rose-500 to-lavender-500 p-2 rounded-lg shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">BondSpace</span>
              </div>
              <p className="text-gray-400">
                AI-powered roommate matching for safe women's co-living spaces.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-rose-300">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-rose-300 transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-rose-300 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-rose-300 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-rose-300 transition-colors">
                    Safety
                  </a>
                </li>
                <li>
                  <Link
                    to="/admin/login"
                    className="hover:text-rose-300 transition-colors"
                  >
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lavender-300">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-lavender-300 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-lavender-300 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-lavender-300 transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-lavender-300 transition-colors"
                  >
                    Guidelines
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gold-300">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-gold-300 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold-300 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold-300 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold-300 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BondSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
