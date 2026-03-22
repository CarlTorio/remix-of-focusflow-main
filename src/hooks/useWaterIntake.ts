import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export function useWaterIntake() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const query = useQuery({
    queryKey: ["water_intake", today],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("water_intake")
        .select("*")
        .eq("tracked_date", today)
        .maybeSingle();
      if (error) throw error;
      return (data?.glasses_count as number) ?? 0;
    },
    enabled: !!user,
  });

  const setGlasses = useMutation({
    mutationFn: async (count: number) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase as any)
        .from("water_intake")
        .upsert(
          { user_id: user.id, tracked_date: today, glasses_count: count },
          { onConflict: "user_id,tracked_date" }
        );
      if (error) throw error;
    },
    onMutate: async (count: number) => {
      await queryClient.cancelQueries({ queryKey: ["water_intake", today] });
      const prev = queryClient.getQueryData(["water_intake", today]);
      queryClient.setQueryData(["water_intake", today], count);
      return { prev };
    },
    onError: (_err: Error, _count: number, context: any) => {
      queryClient.setQueryData(["water_intake", today], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["water_intake", today] });
    },
  });

  return {
    glasses: query.data ?? 0,
    isLoading: query.isLoading,
    setGlasses,
  };
}
