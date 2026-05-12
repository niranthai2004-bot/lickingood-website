import { RewardsPrompt } from "@/components/pickup/RewardsPrompt";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <RewardsPrompt />
    </>
  );
}
