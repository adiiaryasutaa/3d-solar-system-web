import { beforeEach, describe, expect, it } from "vitest";
import { useSolarSystem } from "./useSolarSystem";

function reset() {
  useSolarSystem.setState({
    selectedId: null,
    orbitPaused: false,
    speed: 1,
    tourActive: false,
    labelsVisible: true,
    muted: true,
  });
}

describe("useSolarSystem store", () => {
  beforeEach(reset);

  it("selects a body", () => {
    useSolarSystem.getState().select("earth");
    expect(useSolarSystem.getState().selectedId).toBe("earth");
  });

  it("manual select stops the tour", () => {
    useSolarSystem.setState({ tourActive: true });
    useSolarSystem.getState().select("mars");
    expect(useSolarSystem.getState().tourActive).toBe(false);
  });

  it("tour select keeps the tour running", () => {
    useSolarSystem.setState({ tourActive: true });
    useSolarSystem.getState().select("mars", true);
    expect(useSolarSystem.getState().tourActive).toBe(true);
    expect(useSolarSystem.getState().selectedId).toBe("mars");
  });

  it("toggle selects then deselects the same body and stops the tour", () => {
    const { toggle } = useSolarSystem.getState();
    useSolarSystem.setState({ tourActive: true });
    toggle("venus");
    expect(useSolarSystem.getState().selectedId).toBe("venus");
    expect(useSolarSystem.getState().tourActive).toBe(false);
    toggle("venus");
    expect(useSolarSystem.getState().selectedId).toBeNull();
  });

  it("clear resets selection and tour", () => {
    useSolarSystem.setState({ selectedId: "jupiter", tourActive: true });
    useSolarSystem.getState().clear();
    expect(useSolarSystem.getState().selectedId).toBeNull();
    expect(useSolarSystem.getState().tourActive).toBe(false);
  });

  it("setTour(true) starts at the first planet when nothing is selected", () => {
    useSolarSystem.getState().setTour(true);
    expect(useSolarSystem.getState().tourActive).toBe(true);
    expect(useSolarSystem.getState().selectedId).toBe("mercury");
  });

  it("toggles orbit, labels, mute and sets speed", () => {
    const s = useSolarSystem.getState();
    s.toggleOrbit();
    expect(useSolarSystem.getState().orbitPaused).toBe(true);
    s.toggleLabels();
    expect(useSolarSystem.getState().labelsVisible).toBe(false);
    s.toggleMute();
    expect(useSolarSystem.getState().muted).toBe(false);
    s.setSpeed(2.5);
    expect(useSolarSystem.getState().speed).toBe(2.5);
  });
});
