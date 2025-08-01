import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Home,
  User,
  Camera,
  Edit3,
  Save,
  X,
  ChevronLeft,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  Settings,
  Shield,
  Bell,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    bio: "I'm a marketing professional who loves early morning yoga, cooking healthy meals, and quiet evenings with a good book.",
    age: 24,
    profession: "Marketing Manager",
    location: "San Francisco, CA",
  });

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  const preferences = {
    sleepSchedule: "Early Bird (10 PM - 6 AM)",
    cleanliness: 5,
    socialLevel: 3,
    workFromHome: true,
    hasGuests: "Rarely",
    musicVolume: "Low",
    roomPreferences: {
      floor: "Upper floors preferred",
      window: "Must have natural light",
      size: "Medium to Large",
      budget: "$800-1000",
    },
    dealBreakers: ["No smoking", "No pets", "Quiet after 10 PM"],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blush-50 to-lavender-50 dark:from-black dark:via-black dark:to-black transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-rose-100/20 dark:border-rose-800/30 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                <span className="text-gray-600 dark:text-gray-200">
                  Back to Dashboard
                </span>
              </Link>
            </div>

            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-rose-500 to-lavender-500 p-2 rounded-lg shadow-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-lavender-600 dark:from-rose-400 dark:to-lavender-400 bg-clip-text text-transparent">
                BondSpace
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-200">
            Manage your profile information and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-r from-rose-500 to-lavender-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {formData.firstName.charAt(0)}
                    {formData.lastName.charAt(0)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-200 mb-2">
                  {formData.profession}
                </p>

                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </div>

                <div className="flex justify-center space-x-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                  >
                    Active
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                  >
                    Verified
                  </Badge>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full bg-gradient-to-r from-rose-500 to-lavender-500 hover:from-rose-600 hover:to-lavender-600"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Profile Completion
                  </span>
                  <span className="font-semibold text-rose-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Total Matches
                  </span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Response Rate
                  </span>
                  <span className="font-semibold text-green-600">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Member Since
                  </span>
                  <span className="font-semibold">Jan 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Personal Information</span>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formData.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formData.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formData.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formData.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">About Me</Label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={4}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {formData.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Living Preferences */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Living Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Lifestyle
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Sleep Schedule:
                        </span>
                        <span>{preferences.sleepSchedule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Cleanliness:
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < preferences.cleanliness ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Social Level:
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <User
                              key={i}
                              className={`h-3 w-3 ${i < preferences.socialLevel ? "text-blue-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Room Preferences
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Floor:{" "}
                        </span>
                        <span>{preferences.roomPreferences.floor}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Window:{" "}
                        </span>
                        <span>{preferences.roomPreferences.window}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Size:{" "}
                        </span>
                        <span>{preferences.roomPreferences.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Budget:{" "}
                        </span>
                        <span>{preferences.roomPreferences.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Deal Breakers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences.dealBreakers.map((breaker, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-red-200 text-red-700 dark:border-red-700 dark:text-red-300"
                      >
                        {breaker}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Profile Visibility
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Control who can see your profile
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Manage email and push notifications
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
