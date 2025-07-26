
import React, { createContext, useState, useEffect, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any | null; userId?: string }>;
  signUpAndSetupCompany: (email: string, password: string, personalData: any, companyData: any) => Promise<{ error: any | null; userId?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  checkCompanyAssociation: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });
      
      return { error: null, userId: data.user?.id };
    } catch (error: any) {
      toast({
        title: "Unexpected error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUpAndSetupCompany = async (email: string, password: string, personalData: any, companyData: any) => {
    try {
      // Step 1: Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: personalData.firstName,
            last_name: personalData.lastName,
            phone: personalData.phone,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (!data.user?.id) {
        const userError = new Error("User creation failed - no user ID returned");
        toast({
          title: "Registration failed",
          description: userError.message,
          variant: "destructive",
        });
        return { error: userError };
      }

      const userId = data.user.id;

      // Step 2: Wait a moment for the profiles trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Handle company setup based on action
      try {
        if (companyData.companyAction === "create") {
          // Create new company
          const { data: newCompanyData, error: companyError } = await supabase
            .from('companies')
            .insert([{
              name: companyData.newCompanyName,
              address: companyData.newCompanyAddress,
              organization_number: companyData.newOrganizationNumber
            }])
            .select()
            .single();
            
          if (companyError) {
            toast({
              title: "Company creation failed",
              description: companyError.message,
              variant: "destructive",
            });
            return { error: companyError };
          }

          if (!newCompanyData?.id) {
            const companyIdError = new Error("Company creation failed - no company ID returned");
            toast({
              title: "Company creation failed",
              description: companyIdError.message,
              variant: "destructive",
            });
            return { error: companyIdError };
          }

          // Update user profile with new company
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              company_id: newCompanyData.id,
              is_company_admin: true
            })
            .eq('id', userId);
            
          if (profileError) {
            if (profileError.code === '42501') {
              toast({
                title: "Permission denied",
                description: "Unable to update profile. Please try again or contact support.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Profile update failed",
                description: profileError.message,
                variant: "destructive",
              });
            }
            return { error: profileError };
          }

        } else if (companyData.companyAction === "join") {
          // Join existing company
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              company_id: companyData.existingCompanyId,
              is_company_admin: false
            })
            .eq('id', userId);
            
          if (profileError) {
            if (profileError.code === '42501') {
              toast({
                title: "Permission denied",
                description: "Unable to update profile. Please try again or contact support.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Profile update failed",
                description: profileError.message,
                variant: "destructive",
              });
            }
            return { error: profileError };
          }
        }

        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account.",
        });
        
        return { error: null, userId };
        
      } catch (companySetupError: any) {
        toast({
          title: "Company setup failed",
          description: companySetupError.message,
          variant: "destructive",
        });
        return { error: companySetupError };
      }
      
    } catch (error: any) {
      toast({
        title: "Unexpected error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const checkCompanyAssociation = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking company association:', error);
        return false;
      }

      return data.company_id !== null;
    } catch (error) {
      console.error('Unexpected error checking company:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        duration: 2000,
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Unexpected error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      // Check if the error is due to session not found (user already logged out)
      if (error.message && error.message.includes('session_not_found')) {
        // Treat as successful logout since session is already invalidated
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      } else {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signUpAndSetupCompany,
    signIn,
    signOut,
    checkCompanyAssociation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
