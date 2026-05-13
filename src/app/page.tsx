import { MapScreen } from "@/components/map/map-screen";
import { PeekCard } from "@/components/map/peek-card";
import { TopBar } from "@/components/chrome/top-bar";
import { TabBar } from "@/components/chrome/tab-bar";
import { PlaceDetail } from "@/components/overlays/place-detail";
import { Logbook } from "@/components/overlays/logbook";
import { AddFlow } from "@/components/overlays/add-flow";
import { ProfileStub } from "@/components/overlays/profile-stub";
import { Lists } from "@/components/overlays/lists";
import { ListDetail } from "@/components/overlays/list-detail";
import { ListImport } from "@/components/overlays/list-import";
import { ListFragmentDetector } from "@/components/overlays/list-fragment-detector";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";

export default function Home() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-paper">
      <OnboardingGate />
      <MapScreen />
      <TopBar />
      <PeekCard />

      <PlaceDetail />
      <Logbook />
      <Lists />
      <ListDetail />
      <ListImport />
      <AddFlow />
      <ProfileStub />

      <TabBar />
      <ListFragmentDetector />
    </main>
  );
}
