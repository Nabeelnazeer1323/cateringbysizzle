
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "@/lib/validations/register";
import { CompanySearch } from "@/components/CompanySearch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

interface JoinCompanySectionProps {
  form: UseFormReturn<RegisterFormValues>;
}

export const JoinCompanySection = ({ form }: JoinCompanySectionProps) => {
  const handleCompanySelect = (companyId: string) => {
    form.setValue("existingCompanyId", companyId);
  };
  
  // Fetch initial list of companies
  const { data: existingCompanies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies-for-join'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Search and select your company:</h3>
      <CompanySearch onCompanySelect={handleCompanySelect} />
      
      {isLoadingCompanies ? (
        <div className="flex justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : existingCompanies && existingCompanies.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Or select from recently added companies:</h4>
          <div className="grid grid-cols-1 gap-3">
            {existingCompanies.map((company) => (
              <Button 
                key={company.id}
                variant="outline" 
                onClick={() => handleCompanySelect(company.id)}
                disabled={false}
                className="w-full justify-start h-auto py-3 text-left"
              >
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.address}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
