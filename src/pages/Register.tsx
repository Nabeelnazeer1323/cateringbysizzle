
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, type RegisterFormValues } from "@/lib/validations/register";
import { PersonalInfoFields } from "@/components/auth/PersonalInfoFields";
import { SecurityFields } from "@/components/auth/SecurityFields";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCompanyForm } from "@/components/company/CreateCompanyForm";
import { JoinCompanySection } from "@/components/company/JoinCompanySection";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUpAndSetupCompany, user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate("/order");
    }
  }, [user, navigate]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      companyAction: "create",
      newCompanyName: "",
      newCompanyAddress: "",
      newOrganizationNumber: "",
      existingCompanyId: ""
    }
  });

  // Watch the companyAction to reset relevant fields when switching tabs
  const companyAction = form.watch("companyAction");
  
  useEffect(() => {
    if (companyAction === "create") {
      form.setValue("existingCompanyId", "");
    } else if (companyAction === "join") {
      form.setValue("newCompanyName", "");
      form.setValue("newCompanyAddress", "");
      form.setValue("newOrganizationNumber", "");
    }
  }, [companyAction, form]);

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const personalData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone
      };

      const companyData = {
        companyAction: values.companyAction,
        newCompanyName: values.newCompanyName,
        newCompanyAddress: values.newCompanyAddress,
        newOrganizationNumber: values.newOrganizationNumber,
        existingCompanyId: values.existingCompanyId
      };

      const { error, userId } = await signUpAndSetupCompany(
        values.email, 
        values.password, 
        personalData, 
        companyData
      );

      if (error) {
        setIsLoading(false);
        navigate("/order");
      }

      navigate("/company-registration");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl my-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>
              Register to start your corporate catering journey
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-6">
                <PersonalInfoFields form={form} />
                <Separator />
                <SecurityFields form={form} />
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Company Setup</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To continue, you must either join your company or create a new one.
                  </p>
                  
                  <Tabs 
                    value={companyAction} 
                    onValueChange={(value) => form.setValue("companyAction", value as "create" | "join")}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="create">Create New Company</TabsTrigger>
                      <TabsTrigger value="join">Join Existing Company</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="create">
                      <CreateCompanyForm form={form} />
                    </TabsContent>
                    
                    <TabsContent value="join">
                      <JoinCompanySection form={form} />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <TermsCheckbox />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-orange-600 hover:bg-orange-500"
                >
                  {isLoading ? "Creating Account & Setting Up Company..." : "Create Account & Setup Company"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-catering-secondary hover:text-purple-700">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
