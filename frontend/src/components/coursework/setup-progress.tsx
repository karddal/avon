import SetupProgressCarousel, {
  type SetupProgressArea,
} from "@/components/coursework/setup-progress-carousel";

function getDefaultAreaIndex(areas: SetupProgressArea[]) {
  const actionableIndex = areas.findIndex((area) => area.status === "action");
  if (actionableIndex !== -1) {
    return actionableIndex;
  }

  const readyIndex = areas.findIndex((area) => area.status === "ready");
  if (readyIndex !== -1) {
    return readyIndex;
  }

  return Math.max(areas.length - 1, 0);
}

export type SetupProgressData = {
  areas: SetupProgressArea[];
  defaultIndex?: number;
};

export default function SetupProgress({
  areas,
  defaultIndex,
}: SetupProgressData) {
  return (
    <SetupProgressCarousel
      areas={areas}
      defaultIndex={defaultIndex ?? getDefaultAreaIndex(areas)}
    />
  );
}
