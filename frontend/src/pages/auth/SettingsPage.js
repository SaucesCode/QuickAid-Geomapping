import React, { useState, useEffect } from "react";
import { User, Lock, Edit, Mail, Shield, AlertCircle } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  GradientButton,
  OutlineButton,
  H2,
  Caption,
  Spinner,
} from "../../components/DesignSystem";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import CustomToast from "../../components/CustomToast";

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editedUser, setEditedUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const settingOptions = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  useEffect(() => {
    document.title = "QuickAid | Settings";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setEditedUser({
            username: parsed.username || "",
            first_name: parsed.first_name || "",
            last_name: parsed.last_name || "",
            email: parsed.email || "",
            role: parsed.role || "",
          });
        } else {
          const res = await api.get("/users/me/");
          const userData = res.data;
          setUser(userData);
          setEditedUser({
            username: userData.username || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            role: userData.role || "",
          });
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        toast.error("Failed to load user data. Please try logging in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [storedUser]);

  // ===== HANDLERS =====
  const handleSectionChange = sectionId => {
    setActiveSection(sectionId);
    setIsEditing(false);
  };

  const handleEdit = () => setIsEditing(true);

  const handleChange = e => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/users/update-profile/", editedUser);
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsEditing(false);

      toast.custom(t => (
        <CustomToast
          t={t}
          type="edit"
          customMessage="Your profile information has been updated successfully."
        />
      ));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error("New passwords do not match");
        return;
      }

      if (passwordData.new_password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      await api.put("/users/change-password/", {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      toast.custom(t => (
        <CustomToast
          t={t}
          type="success"
          customMessage="Your password has been changed successfully."
        />
      ));
    } catch (error) {
      console.error(error);
      toast.error("Failed to change password. Please check your current password.");
    }
  };

  // ===== RENDER =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <Caption>Loading settings...</Caption>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <H2 className="mb-2">No User Data Found</H2>
          <Caption>Please login again to access settings.</Caption>
        </Card>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        icon={Shield}
        title="Account Settings"
        subtitle="Manage your profile and security preferences"
      />

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {settingOptions.map(section => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <Card>
              <div className="border-b border-gray-200 pb-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <H2>Profile Information</H2>
                      <Caption>Update your personal details</Caption>
                    </div>
                  </div>
                  {!isEditing && (
                    <GradientButton onClick={handleEdit} className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </GradientButton>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Username"
                      name="username"
                      value={editedUser.username}
                      onChange={handleChange}
                      icon={User}
                    />
                    <InputField
                      label="Email Address"
                      name="email"
                      value={editedUser.email}
                      readOnly
                      icon={Mail}
                    />
                    <InputField
                      label="First Name"
                      name="first_name"
                      value={editedUser.first_name}
                      onChange={handleChange}
                      icon={User}
                    />
                    <InputField
                      label="Last Name"
                      name="last_name"
                      value={editedUser.last_name}
                      onChange={handleChange}
                      icon={User}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-5 border-t border-gray-200">
                    <OutlineButton onClick={() => setIsEditing(false)}>Cancel</OutlineButton>
                    <GradientButton onClick={handleSave}>Save Changes</GradientButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DisplayField label="Username" value={user.username} />
                    <DisplayField label="Email" value={user.email} />
                    <DisplayField label="First Name" value={user.first_name} />
                    <DisplayField label="Last Name" value={user.last_name} />
                    <DisplayField label="Role" value={user.role || "User"} />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Password Section */}
          {activeSection === "password" && (
            <Card>
              <div className="border-b border-gray-200 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <H2>Change Password</H2>
                    <Caption>Update your account password</Caption>
                  </div>
                </div>
              </div>

              <div className="max-w-lg space-y-5">
                {["current_password", "new_password", "confirm_password"].map((key, idx) => (
                  <PasswordInput
                    key={key}
                    label={
                      idx === 0
                        ? "Current Password"
                        : idx === 1
                        ? "New Password"
                        : "Confirm New Password"
                    }
                    value={passwordData[key]}
                    onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                  />
                ))}

                <div className="pt-2">
                  <GradientButton
                    onClick={handlePasswordChange}
                    disabled={
                      !passwordData.current_password ||
                      !passwordData.new_password ||
                      !passwordData.confirm_password
                    }
                    className="gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </GradientButton>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

// === Small Reusable Components ===
const InputField = ({ label, name, value, onChange, icon: Icon, readOnly = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border transition-colors duration-200 ${
          readOnly
            ? "bg-gray-50 cursor-not-allowed border-gray-200 text-gray-600"
            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900"
        } outline-none`}
      />
    </div>
  </div>
);

const PasswordInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative group">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
      <input
        type="password"
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-colors duration-200 text-gray-900"
      />
    </div>
  </div>
);

const DisplayField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
      {label}
    </label>
    <p className="text-gray-900 font-medium text-sm bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
      {value || "Not provided"}
    </p>
  </div>
);

export default SettingsPage;
