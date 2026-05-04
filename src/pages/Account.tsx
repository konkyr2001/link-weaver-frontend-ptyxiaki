import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Crown, Plus, Trash2, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Header from "@/components/Header";
import { 
  updateProfile, 
  changePassword, 
  getUser,
  deleteGoogleUser,
  deleteLocalUser,
} from "@/services/user";

function getTimeRemaining(expiresAt: string) {
  const delta = Math.max(0, new Date(expiresAt).getTime() - Date.now()) / 1000;

  const days = Math.floor(delta / 86400);
  const hours = Math.floor((delta % 86400) / 3600);
  const minutes = Math.floor((delta % 3600) / 60);

  return { days, hours, minutes };
}

const Account = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  // Fetch fresh user data from API on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      const freshUser = await getUser(token);
      if (!freshUser?.error) {
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
      }
    };
    fetchUser();
  }, []);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isGoogleUser = user.authProvider === "google";

  const plan = user.plan || "free";
  const isTrial = user.trialEnd && new Date(user.trialEnd) > new Date();
  const currentPeriodEnd = isTrial ? user.trialEnd : user.currentPeriodEnd;

  const timeRemaining = currentPeriodEnd ? getTimeRemaining(currentPeriodEnd) : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      return toast.error("First name is required");
    }
    setSavingProfile(true);
    const updatedUser = await updateProfile(token, firstName, lastName);
    if (updatedUser.error) {
      toast.error(updatedUser.error);
      setSavingProfile(false);
      return;
    }
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("Profile updated successfully");
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      return toast.error("Please enter your current password");
    }
    if (!newPassword.trim()) {
      return toast.error("Please enter a new password");
    }
    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return toast.error("Password must include a lowercase, an uppercase and a number");
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error("New passwords do not match");
    }
    setSavingPassword(true);
    const updatedPassword = await changePassword(token, currentPassword, newPassword);
    if (updatedPassword.error) {
      setSavingPassword(false);
      toast.error(updatedPassword.error);
      return;
    }
    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setSavingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (isGoogleUser) {
      if (deleteConfirmText !== "DELETE") {
        return toast.error("Please type DELETE to confirm");
      }
      const deletedUser = await deleteGoogleUser(token);
      if (deletedUser.error) {
        return toast.error(deletedUser.error);
      }
    } else {
      if (!deletePassword.trim()) {
        return toast.error("Please enter your password to confirm");
      }
      const deletedUser = await deleteLocalUser(token, deletePassword);
      if (deletedUser.error) {
        return toast.error(deletedUser.error);
      }
    }
    setDeleting(true);
    toast.success("Account deleted");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const planLabel = plan === "pro" ? "Pro" : plan === "plus" ? "Plus" : "Free";
  const PlanIcon = plan === "pro" ? Crown : plan === "plus" ? Plus : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header active="account" />

      <main className="flex-1 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Account</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
          </div>

          {/* Plan Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {PlanIcon && <PlanIcon className="w-5 h-5 text-primary" />}
                Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant={plan === "free" ? "secondary" : "default"} className="text-sm">
                  {planLabel}
                </Badge>
                {isTrial && (
                  <Badge variant="outline" className="text-sm border-primary/50 text-primary">
                    Trial
                  </Badge>
                )}
              </div>
              {currentPeriodEnd && timeRemaining && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isTrial
                        ? timeRemaining.days > 0
                          ? `Trial expires in ${timeRemaining.days} day${timeRemaining.days !== 1 ? "s" : ""}${
                              timeRemaining.days < 7 && timeRemaining.hours > 0
                                ? ` and ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? "s" : ""}`
                                : ""
                            }`
                          : timeRemaining.hours > 0
                            ? `Trial expires in ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? "s" : ""}`
                            : timeRemaining.minutes > 0
                              ? `Trial expires in ${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? "s" : ""}`
                              : "Trial expires in less than a minute"
                        : timeRemaining.days > 0
                          ? `${user.autoRenewEnabled ? "Renews" : "Expires"} in ${timeRemaining.days} day${timeRemaining.days !== 1 ? "s" : ""}${
                              timeRemaining.days < 7 && timeRemaining.hours > 0
                                ? ` and ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? "s" : ""}`
                                : ""
                            }`
                          : timeRemaining.hours > 0
                            ? `${user.autoRenewEnabled ? "Renews" : "Expires"} in ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? "s" : ""}`
                            : timeRemaining.minutes > 0
                              ? `${user.autoRenewEnabled ? "Renews" : "Expires"} in ${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? "s" : ""}`
                              : "Expires in less than a minute"}
                    </span>
                    <span className="text-muted-foreground/60">
                      ({new Date(currentPeriodEnd).toLocaleDateString()})
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">Auto-renewal</p>
                      <p className="text-xs text-muted-foreground">
                        {user.autoRenewEnabled
                          ? "Your plan will automatically renew"
                          : "Your plan will expire at the end of the period"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="pl-10 opacity-60"
                    />
                  </div>
                  {/* <p className="text-xs text-muted-foreground">Email changes require verification (coming soon)</p> */}
                </div>

                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          {user.authProvider === "local" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmNewPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword ? "Updating…" : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Delete Account */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account, all your bundles, and subscription data.
                      {isGoogleUser
                        ? ' Type "DELETE" below to confirm.'
                        : " Enter your password to confirm."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 py-2">
                    {isGoogleUser ? (
                      <>
                        <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                        <Input
                          id="deleteConfirm"
                          type="text"
                          placeholder='Type "DELETE"'
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          autoComplete="off"
                        />
                      </>
                    ) : (
                      <>
                        <Label htmlFor="deletePassword">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="deletePassword"
                            type={showDeletePassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setDeletePassword(""); setDeleteConfirmText(""); }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting || (isGoogleUser ? deleteConfirmText !== "DELETE" : !deletePassword.trim())}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? "Deleting…" : "Delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Account;
