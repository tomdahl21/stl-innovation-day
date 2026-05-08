import { MapScreen } from "@/components/map/map-screen";
import { PeekCard } from "@/components/map/peek-card";
import { TopBar } from "@/components/chrome/top-bar";
import { TabBar } from "@/components/chrome/tab-bar";
import { PlaceDetail } from "@/components/overlays/place-detail";
import { Logbook } from "@/components/overlays/logbook";
import { AddFlow } from "@/components/overlays/add-flow";
import { ProfileStub } from "@/components/overlays/profile-stub";

export default function Home() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-paper">
      <MapScreen />
      <TopBar />
      <PeekCard />

      <PlaceDetail />
      <Logbook />
      <AddFlow />
      <ProfileStub />

      <TabBar />
    </main>
  );
}
