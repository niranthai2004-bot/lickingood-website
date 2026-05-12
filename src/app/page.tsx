import { Hero } from "@/components/sections/Hero";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import { Promotions } from "@/components/sections/Promotions";
import { Rewards } from "@/components/sections/Rewards";
import { Story } from "@/components/sections/Story";
import { Reviews } from "@/components/sections/Reviews";
import { OrderingCTA } from "@/components/sections/OrderingCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedMenu />
      <Promotions />
      <Rewards />
      <Story />
      <Reviews />
      <OrderingCTA />
    </>
  );
}
